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
        if word in model.wv:
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
            good_to_have_skills = project_creators[i].get('good_to_have_skills')
            if(len(good_to_have_skills) > 0):
                all_good_to_have_skills.append(project_creators[i].get('good_to_have_skills'))
        
            
        all_mandatory_skills = []
        for i in range(len(project_creators)):
            mandatory_skills = project_creators[i].get('mandatory_skills')
            if(len(mandatory_skills) > 0):
                all_mandatory_skills.append(project_creators[i].get('mandatory_skills'))

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
# Mandatory skills [skill1, skill2, skill3] Project Creator
# Mandatory skills [skill1, skill2, skill3,skill4,skill5] Contributor

        for project_creator in project_creators:
            # Check if the contributor types match
            if user_type == project_creator['contributor_type']:
                # Check if good-to-have skills are a subset of mandatory skills
                if set(project_creator['good_to_have_skills']).issubset(set(user_mandatory_skills)):
                    good_to_have_skills_similarity = 1.0
                else:
                    good_to_have_skills_similarity = cosine_similarity(
                        average_word_vectors(
                            user_mandatory_skills, model, 100),
                        average_word_vectors(
                            project_creator['good_to_have_skills'], model, 100)
                    )

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

                # Check if the combined similarity meets your threshold (e.g., 2.0)
                if combined_similarity >= 2.0:
                    matched_users.append(project_creator)

        print(matched_users, " matched users")
        return jsonify({"matchedUsers": matched_users})

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
        all_good_to_have_skills = [user["good_to_have_skills"]]
        all_mandatory_skills = user['mandatory_skills']
        for i in range(len(contributors)):
            skills = contributors[i].get('skills')
            if(len(skills) > 0):
                all_mandatory_skills.append(contributors[i].get('skills'))

        model = Word2Vec(all_mandatory_skills + all_good_to_have_skills,
                         vector_size=100, window=5, min_count=1, sg=0)

        matched_users = []

        for contributor in contributors:
            if user_type == contributor['contributor_type']:
                if(all(skill in user_mandatory_skills for skill in contributor['skills'])):
                # if set(contributor['skills']).issubset(set(user_mandatory_skills)):
                    good_to_have_skills_similarity = 1.0
                else:
                    good_to_have_skills_similarity = cosine_similarity(
                        average_word_vectors(
                            user_mandatory_skills, model, 100),
                        average_word_vectors(
                            contributor['skills'], model, 100)
                    )
                    
                if(all(skill in user_mandatory_skills for skill in contributor['skills'])):
                # if set(contributor['skills']).issubset(set(user_mandatory_skills)):
                    mandatory_skills_similarity = 1.0
                else:
                    mandatory_skills_similarity = cosine_similarity(
                        average_word_vectors(
                            user_mandatory_skills, model, 100),
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

                if combined_similarity >= 2.0:
                    matched_users.append(contributor)

        print(matched_users, " matched users")
        return jsonify({"matchedUsers": matched_users})

    else:
        return jsonify({"error": "Invalid role"}), 400


if __name__ == '__main__':
    app.run(port=3000)
