from flask import Flask, request, jsonify
import requests

app = Flask(__name__)


@app.route('/get-matched-users', methods=['POST'])
def get_matched_users():
    received_data = request.get_json()
    print(received_data, " received data")
    # Retrieve user and role from received_data
    user = received_data.get('user')
    role = received_data.get('role')

    if user is None or role is None:
        return jsonify({"error": "User data missing"}), 400


    # Perform matching logic based on user role
    if role == 'contributor':
        response = requests.get('http://127.0.0.1:5000/api/v1/project-creators')
        project_creators = response.json()
        print(project_creators)
    elif role == 'project-creator':
        response = requests.get('http://127.0.0.1:5000/api/v1/contributors')
        contributors = response.json()
        print(contributors)
    else:
        return jsonify({"error": "Invalid role"}), 400

    matched_users = []
    # Cosine Similarity Matching Logic
    
    
    # Cosine Similarity Matching Logic

    print(matched_users, " matched users")
    return jsonify({"matchedUsers": matched_users})

if __name__ == '__main__':
    app.run(port=3000)
