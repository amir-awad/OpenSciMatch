from flask import Flask, request, jsonify
import requests
import numpy as np
from gensim.models import Word2Vec
from flask import Flask, request, render_template
import spacy

app = Flask(__name__)

# -----------------------------------------------------------For the matching logic-----------------------------------------------------------#
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
        project_creators = response.json()
        print(project_creators)
        # Extract relevant attributes for contributors and project creators
        user_mandatory_skills = user.get('skills')
        user_expertise = user.get('expertise_level')
        user_type = user.get('contributor_type')
        # Train Word2Vec model
        all_good_to_have_skills = [
            profile['good_to_have_skills'] for profile in project_creators]
        all_mandatory_skills = [profile['mandatory_skills']
                                for profile in project_creators + user["skills"]]

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
        contributors = response.json()
        print(contributors)
        user_mandatory_skills = user.get('mandatory_skills')
        # Default to an empty list if not provided
        user_good_to_have_skills = user.get('good_to_have_skills', [])
        user_expertise = user.get('expertise_level')
        user_type = user.get('contributor_type')
        all_good_to_have_skills = [user["good_to_have_skills"]]
        all_mandatory_skills = [profile['skills']
                                for profile in contributors + user["mandatory_skills"]]

        model = Word2Vec(all_mandatory_skills + all_good_to_have_skills,
                         vector_size=100, window=5, min_count=1, sg=0)

        matched_users = []

        for contributor in contributors:
            if user_type == contributor['contributor_type']:
                if set(contributor['good_to_have_skills']).issubset(set(user_mandatory_skills)):
                    good_to_have_skills_similarity = 1.0
                else:
                    good_to_have_skills_similarity = cosine_similarity(
                        average_word_vectors(
                            user_mandatory_skills, model, 100),
                        average_word_vectors(
                            contributor['good_to_have_skills'], model, 100)
                    )

                if set(contributor['mandatory_skills']).issubset(set(user_mandatory_skills)):
                    mandatory_skills_similarity = 1.0
                else:
                    mandatory_skills_similarity = cosine_similarity(
                        average_word_vectors(
                            user_mandatory_skills, model, 100),
                        average_word_vectors(
                            contributor['mandatory_skills'], model, 100)
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
# -----------------------------------------------------------End of matching logic-----------------------------------------------------------#


# -----------------------------------------------------------For the chatbot-----------------------------------------------------------#
# Load the spaCy NLP model
nlp = spacy.load("en_core_web_sm")

# Define a list of predefined skills
predefined_skills = ["astrophysics", "rocket science",
                     "orbital mechanics", "space exploration"]

# Function to extract multi-word skills


def extract_multi_word_skills(doc):
    skills = []
    current_skill = ""

    for token in doc:
        if token.text.lower() in predefined_skills:
            if current_skill:
                skills.append(current_skill)
                current_skill = ""
            current_skill += token.text
        else:
            if current_skill:
                current_skill += " "
            current_skill += token.text

    if current_skill:
        skills.append(current_skill)

    return skills

# Define a basic HTML form for user input


@app.route("/chatbot.html", methods=["GET", "POST"])
def chatbot():
    user_input = ""
    skills = []
    expertise_level = None
    contributor_type = None

    if request.method == "POST":
        user_input = request.form.get("user_input")
        doc = nlp(user_input)
        skills = extract_multi_word_skills(doc)

        for token in doc:
            if token.text.lower() in ["beginner", "intermediate", "advanced", "expert"]:
                expertise_level = token.text.lower()
                break

        for token in doc:
            if token.text.lower() in ["developer", "designer", "researcher", "writer"]:
                contributor_type = token.text.lower()
                break

    return render_template("chatbot.html", user_input=user_input, skills=skills, expertise_level=expertise_level, contributor_type=contributor_type)


if __name__ == '__main__':
    app.run(port=3000)
