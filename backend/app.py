from flask import Flask, request, jsonify
from pymongo import MongoClient
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta
import os

cluster = MongoClient("mongodb://localhost:27017")
accounts_db = cluster["accounts"]
collection_db = accounts_db["accounts_collection"]
reference_db = accounts_db["reference_collection"]

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'your_secret_key'
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)
jwt = JWTManager(app)


def add_to_database(data, db):
    if db == 'accounts':
        collection_db.insert_one(data)
    elif db == 'references':
        reference_db.insert_one(data)


def find_in_database(email=None, phone_number=None):
    if email:
        user = collection_db.find_one({"email": email})
        if user:
            return user['password']
    elif phone_number:
        user = collection_db.find_one({"phone_number": phone_number})
        if user:
            return user['password']


@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data['name']
    surname = data['surname']
    patronymic = data['patronymic']
    password = data['password']
    phone_number = data['phone_number']
    email = data['email']
    birthday = data['birthday']
    position = data.get("position", "")
    user_type = data['user_type']

    add_to_database(
        {'name': name, 'surname': surname, 'patronymic': patronymic, 'password': password, 'phone_number': phone_number,
         'email': email,
         'birthday': birthday, 'position': position, 'user_type': user_type}, 'accounts')
    return jsonify({'message': 'User registered successfully'})


# Получение входных данных пользователя
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    password = data['password']
    if data['email']:
        email = data['email']
        if find_in_database(email=email) == password:
            access_token = create_access_token(identity=email)
            print(access_token, 'token')
            return jsonify(access_token=access_token), 200
        else:
            return jsonify({'message': 'incorrect password'})
    elif data['phone_number']:
        phone_number = data['phone_number']
        if find_in_database(phone_number=phone_number) == password:
            access_token = create_access_token(identity=phone_number)
            print(access_token, 'token')
            return jsonify(access_token=access_token), 200
        else:
            return jsonify({'message': 'incorrect password'})
    else:
        return jsonify({'message': 'no email or phone_number'})


@app.route('/add_references', methods=['POST'])
@jwt_required()
def add_reff():
    data = request.get_json()
    date = data.get['date']
    if request.files.get("image", False):
        image = request.files['image']
        print('image', image)
        path = os.path.join(app.root_path, 'images', image.filename)
        image.save(path)
        data['image'] = image.filename
    img = data['image']
    if collection_db.find_one({"email": get_jwt_identity()}):
        person_id = collection_db.find_one({"email": get_jwt_identity()})['_id']
    elif collection_db.find_one({"phone_number": get_jwt_identity()}):
        person_id = collection_db.find_one({"phone_number": get_jwt_identity()})['_id']
    else:
        return jsonify({'message': 'user not found'})

    add_to_database({'_id': person_id, 'date': date, 'image': img}, reference_db)
    return jsonify({'message': 'добавленно в таблицу '})


@app.route('/show_references', methods=['POST'])
@jwt_required()
def show_ref():
    result = []
    user = reference_db.find({})
    for document in user:
        result.append(document)
    return jsonify({result})


@app.route('/show_doctor', methods=['POST'])
@jwt_required()
def show_doctor():
    result = []
    data = request.get_json()
    search_item = data.get['search_item']
    user = collection_db.find({
        "$or": [
            {"surname": {"$regex": search_item, "$options": "i"}},
            {"name": {"$regex": search_item, "$options": "i"}},
            {"": {"$regex": search_item, "$options": "i"}},
            {"position": {"$regex": search_item, "$options": "i"}}
        ]
    })
    for document in user:
        result.append(document)
    return jsonify({result})


@app.route('/get_user_by_key', methods=['POST'])
@jwt_required()
def get_user():
    if collection_db.find_one({"email": get_jwt_identity()}):
        result = collection_db.find_one({"email": get_jwt_identity()})
        return jsonify({result})
    elif collection_db.find_one({"phone_number": get_jwt_identity()}):
        result = collection_db.find_one({"phone_number": get_jwt_identity()})
        return jsonify({result})


if __name__ == '__main__':
    app.run()
