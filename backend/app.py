from flask import Flask, request, jsonify
from pymongo import MongoClient
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta

cluster = MongoClient("mongodb://localhost:27017")
accounts_db = cluster["accounts"]
collection_db = accounts_db["accounts_collection"]

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'your_secret_key'
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)
jwt = JWTManager(app)


def add_to_database(data):
    collection_db.insert_one(data)


def find_in_database(mail=None, phone_number=None):
    if mail:
        user = collection_db.find_one({"mail": mail})
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
    mail = data['mail']
    birthday = data['birthday']
    position = data['position']
    user_type = data['user_type']

    add_to_database(
        {'name': name, 'surname': surname, 'patronymic': patronymic, 'password': password, 'phone_number': phone_number,
         'mail': mail,
         'birthday': birthday, 'position': position, 'user_type': user_type})
    return jsonify({'message': 'User registered successfully'})


# Получение входных данных пользователя
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    password = data['password']
    if data['mail']:
        mail = data['mail']
        if find_in_database(mail=mail) == password:
            access_token = create_access_token(identity=mail)
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


if __name__ == '__main__':
    app.run()
