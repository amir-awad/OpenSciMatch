from flask import Flask, request, jsonify
import requests
import numpy as np
from gensim.models import Word2Vec

app = Flask(__name__)


# Calculate document vectors (average of word vectors)
def average_word_vectors(words, model, num_features):
    feature_vector = np.zeros((num_features,), dtype="float32")
    n_words = 0

    for word in words:
        if isinstance(word, str) and word in model.wv:
            n_words += 1
            feature_vector = np.add(feature_vector, model.wv[word])

    if n_words > 0:
        feature_vector = np.divide(feature_vector, n_words)

    return feature_vector

# Function to calculate cosine similarity between two vectors


def cosine_similarity(vec1, vec2):
    return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))


# Define a mapping for expertise levels
expertise_level_mapping = {
    'beginner': 0.2,
    'intermediate': 0.5,
    'expert': 0.8,
}


@app.route('/get-matched-users', methods=['POST'])
def get_matched_users():
    received_data = request.get_json()
    print(received_data, " received data")
    user = received_data.get('user')
    role = received_data.get('role')

    if user is None or role is None:
        return jsonify({"error": "User data missing"}), 400

    if role == 'contributor':
        response = requests.get(
            'http://127.0.0.1:5000/api/v1/project-creators')
        project_creators = response.json().get('projectCreators')
        print(project_creators)
        # Extract relevant attributes for contributors and project creators
        user_mandatory_skills = user.get('skills')
        user_expertise = user.get('expertise_level')
        user_type = user.get('contributor_type')
        # Train Word2Vec model
        # all_good_to_have_skills = [
        #     profile['good_to_have_skills'] for profile in project_creators]
        all_good_to_have_skills = []
        for i in range(len(project_creators)):
            good_to_have_skills = project_creators[i].get(
                'good_to_have_skills')
            if (len(good_to_have_skills) > 0):
                all_good_to_have_skills.append(
                    project_creators[i].get('good_to_have_skills'))

        all_mandatory_skills = []
        all_mandatory_skills.append(user_mandatory_skills)
        for i in range(len(project_creators)):
            mandatory_skills = project_creators[i].get('mandatory_skills')
            if (len(mandatory_skills) > 0):
                all_mandatory_skills.append(
                    project_creators[i].get('mandatory_skills'))

        # Contributor [Manadatory skills, Expertise level, Contributor type] ,
        # Project Creator [Manadatory skills, Good to have skills, Expertise level, Contributor type]
        # Similariy is calculated between
        # 1- Contributor type and Project Creator type
        # 2- Contributor mandatory skills and Project Creator mandatory skills
        # 2- Contributor mandatory skills and Project Creator good to have skills
        # 4- Contributor expertise level and Project Creator expertise level

        model = Word2Vec(all_mandatory_skills + all_good_to_have_skills,
                         vector_size=100, window=5, min_count=1, sg=0)

        matched_users = []
        similarity_details = []
        
# Mandatory skills [skill1, skill2, skill3] Project Creator
# Mandatory skills [skill1, skill2, skill3,skill4,skill5] Contributor

        for project_creator in project_creators:
            # Check if the contributor types match
            if user_type == project_creator['contributor_type']:
                
                # Check if mandatory skills are a subset of mandatory skills
                if set(project_creator['mandatory_skills']).issubset(set(user_mandatory_skills)):
                    mandatory_skills_similarity = 1.0
                else:
                    mandatory_skills_similarity = cosine_similarity(
                        average_word_vectors(
                            user_mandatory_skills, model, 100),
                        average_word_vectors(
                            project_creator['mandatory_skills'], model, 100)
                    )
                if (mandatory_skills_similarity > 0.1):
                    if len(project_creator['good_to_have_skills']) == 0:
                        good_to_have_skills_similarity = 0.0
                    elif set(project_creator['good_to_have_skills']).issubset(set(user_mandatory_skills)):
                        good_to_have_skills_similarity = 1.0
                    else:
                        good_to_have_skills_similarity = cosine_similarity(
                            average_word_vectors(
                                user_mandatory_skills, model, 100),
                            average_word_vectors(
                                project_creator['good_to_have_skills'], model, 100)
                        )
                    
                    # Map expertise levels to numerical values
                    user_expertise_value = expertise_level_mapping.get(
                        user_expertise, 0.0)
                    project_expertise_value = expertise_level_mapping.get(
                        project_creator['expertise_level'], 0.0)

                    # Calculate expertise level similarity
                    expertise_level_similarity = 1 - \
                        abs(user_expertise_value - project_expertise_value)

                    # Sum up the similarities for all aspects
                    combined_similarity = (
                        mandatory_skills_similarity +
                        good_to_have_skills_similarity + expertise_level_similarity
                    )
                    combined_similarity = float(combined_similarity)
                    mandatory_skills_similarity = float(mandatory_skills_similarity)
                    good_to_have_skills_similarity = float(good_to_have_skills_similarity)
                    expertise_level_similarity = float(expertise_level_similarity)
                    matching_type = ""  # Initialize matching_type

                    
                    # Initialize the dictionary to hold the contributor and similarity details
                    contributor_with_similarity = {
                            "project_creator": project_creator,
                            "similarity": {
                            "mandatory_skills_similarity": mandatory_skills_similarity,
                            "good_to_have_skills_similarity": good_to_have_skills_similarity,
                            "expertise_level_similarity": expertise_level_similarity,
                            "combined_similarity": combined_similarity
                        }
                    }

                                        # Check if combined similarity = 3 make it a perfect match
                    if combined_similarity == 3:
                        matching_type = "perfect-match"
                        contributor_with_similarity["similarity"]["matching-type"] = matching_type

                    # Check if mandatory skills similarity = 1 and good to have skills < 1 and expertise level similarity = 1, make it a very good match
                    elif mandatory_skills_similarity == 1 and good_to_have_skills_similarity < 1 and expertise_level_similarity == 1:
                        matching_type = "very-good-match"
                        contributor_with_similarity["similarity"]["matching-type"] = matching_type

                    # Check if expertise level similarity >= 0.65 and mandatory skills similarity >= 0.7
                    elif expertise_level_similarity >= 0.65 and mandatory_skills_similarity >= 0.7:
                        matching_type = "good-match"
                        contributor_with_similarity["similarity"]["matching-type"] = matching_type

                    # Append the contributor with similarity details to the matched_users list
                    matched_users.append(contributor_with_similarity)
                        
        # Sort matched_users first by "mandatory_skills_similarity" in descending order, then by "expertise_level_similarity," and finally by "good_to_have_skills_similarity"
        matched_users.sort(key=lambda x: (
            x.get("mandatory_skills_similarity", 0),
            x.get("expertise_level_similarity", 0),
            x.get("good_to_have_skills_similarity", 0)
        ), reverse=True)
        print(matched_users, " matched users")
        print(similarity_details, " similarity details")
        

        return jsonify({"matchedUsers": matched_users, "similarityDetails": similarity_details})

    elif role == 'project-creator':
        # Similar logic as above, but for project creators matching with contributors
        response = requests.get('http://127.0.0.1:5000/api/v1/contributors')
        contributors = response.json().get('contributors')
        print(contributors)
        user_mandatory_skills = user.get('mandatory_skills')
        # Default to an empty list if not provided
        user_good_to_have_skills = user.get('good_to_have_skills', [])
        user_expertise = user.get('expertise_level')
        user_type = user.get('contributor_type')
        all_good_to_have_skills = []
        all_mandatory_skills = []

        all_good_to_have_skills.append(user["good_to_have_skills"])
        all_mandatory_skills.append(user['mandatory_skills'])
        for i in range(len(contributors)):
            skills = contributors[i].get('skills')
            if (len(skills) > 0):
                all_mandatory_skills.append(contributors[i].get('skills'))

        model = Word2Vec(all_mandatory_skills + all_good_to_have_skills,
                         vector_size=100, window=5, min_count=1, sg=0)

        matched_users = []
        similarity_details = []

        for contributor in contributors:
            if user_type == contributor['contributor_type']:
                print(user_mandatory_skills, " user mandatory skills")
                print(contributor['skills'], " contributor skills")
                # if (all(skill in user_mandatory_skills for skill in contributor['skills'])):
                if set(user_mandatory_skills).issubset(set(contributor['skills'])):
                    mandatory_skills_similarity = 1.0
                else:
                    mandatory_skills_similarity = cosine_similarity(
                        average_word_vectors(
                            user_mandatory_skills, model, 100),
                        average_word_vectors(
                            contributor['skills'], model, 100)
                    )
                if (mandatory_skills_similarity > 0.5):
                    if len(user['good_to_have_skills']) == 0:
                        good_to_have_skills_similarity = 0.0
                    # elif (all(skill in user_good_to_have_skills for skill in contributor['skills'])):
                    elif set(user_mandatory_skills).issubset(set(contributor['skills'])):
                        good_to_have_skills_similarity = 1.0
                    else:
                        good_to_have_skills_similarity = cosine_similarity(
                            average_word_vectors(
                                user_good_to_have_skills, model, 100),
                            average_word_vectors(
                                contributor['skills'], model, 100)
                        )

                    
                    user_expertise_value = expertise_level_mapping.get(
                        user_expertise, 0.0)
                    contributor_expertise_value = expertise_level_mapping.get(
                        contributor['expertise_level'], 0.0)

                    expertise_level_similarity = 1 - \
                        abs(user_expertise_value - contributor_expertise_value)

                    combined_similarity = (
                        mandatory_skills_similarity +
                        good_to_have_skills_similarity + expertise_level_similarity
                    )

                    combined_similarity = float(combined_similarity)
                    mandatory_skills_similarity = float(mandatory_skills_similarity)
                    good_to_have_skills_similarity = float(good_to_have_skills_similarity)
                    expertise_level_similarity = float(expertise_level_similarity)
                    print(combined_similarity, " combined similarity")
                    print(mandatory_skills_similarity, " mandatory skills similarity")
                    print(good_to_have_skills_similarity, " good to have skills similarity")
                    print(expertise_level_similarity, " expertise level similarity")
                    
                    
                    # Initialize the dictionary to hold the contributor and similarity details
                    contributor_with_similarity = {
                            "contributor": contributor,
                            "similarity": {
                            "mandatory_skills_similarity": mandatory_skills_similarity,
                            "good_to_have_skills_similarity": good_to_have_skills_similarity,
                            "expertise_level_similarity": expertise_level_similarity,
                            "combined_similarity": combined_similarity
                        }
                    }
                        
                                        # Check if combined similarity = 3 make it a perfect match
                    if combined_similarity == 3:
                        matching_type = "perfect-match"
                        contributor_with_similarity["similarity"]["matching-type"] = matching_type

                    # Check if mandatory skills similarity = 1 and good to have skills < 1 and expertise level similarity = 1, make it a very good match
                    elif mandatory_skills_similarity == 1 and good_to_have_skills_similarity < 1 and expertise_level_similarity == 1:
                        matching_type = "very-good-match"
                        contributor_with_similarity["similarity"]["matching-type"] = matching_type

                    # Check if expertise level similarity >= 0.65 and mandatory skills similarity >= 0.7
                    elif expertise_level_similarity >= 0.65 and mandatory_skills_similarity >= 0.7:
                        matching_type = "good-match"
                        contributor_with_similarity["similarity"]["matching-type"] = matching_type

                    # Append the contributor with similarity details to the matched_users list
                    matched_users.append(contributor_with_similarity)
                        
        # Sort matched_users first by "mandatory_skills_similarity" in descending order, then by "expertise_level_similarity," and finally by "good_to_have_skills_similarity"
        matched_users.sort(key=lambda x: (
            x.get("mandatory_skills_similarity", 0),
            x.get("expertise_level_similarity", 0),
            x.get("good_to_have_skills_similarity", 0)
        ), reverse=True)
        print(matched_users, " matched users")

        return jsonify({"matchedUsers": matched_users, "similarityDetails": similarity_details})

    else:
        return jsonify({"error": "Invalid role"}), 400


if __name__ == '__main__':
    app.run(port=3000)
