from flask import Flask, request, jsonify
from pymongo import MongoClient

cluster = MongoClient("mongodb://localhost:27017")
accounts_db = cluster["accounts"]
collection_db = accounts_db["accounts_collection"]

app = Flask(__name__)


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
            return jsonify({'message': 'Login successful'})
        else:
            return jsonify({'message': 'incorrect password'})
    elif data['phone_number']:
        phone_number = data['phone_number']
        if find_in_database(phone_number=phone_number) == password:
            return jsonify({'message': 'Login successful'})
        else:
            return jsonify({'message': 'incorrect password'})
    else:
        return jsonify({'message': 'incorrect mail or phone number'})


if __name__ == '__main__':
    app.run()
