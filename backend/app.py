from flask import Flask, request, jsonify, send_file
from pymongo import MongoClient
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta
import os
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from flask_socketio import SocketIO, emit, join_room, leave_room

cluster = MongoClient("mongodb://localhost:27017")
accounts_db = cluster["accounts"]
collection_db = accounts_db["accounts_collection"]
reference_db = accounts_db["reference_collection"]

app = Flask(__name__)
CORS(app)
app.config['JWT_SECRET_KEY'] = 'your_secret_key'
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)
jwt = JWTManager(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# add something to data base
def add_to_database(data, db):
    if db == 'accounts':
        collection_db.insert_one(data)
    elif db == 'references':
        reference_db.insert_one(data)


# password from  data base
def find_in_database(email=None, phone_number=None):
    if email:
        user = collection_db.find_one({"email": email})
        if user:
            return user['password']
    elif phone_number:
        user = collection_db.find_one({"phone_number": phone_number})
        if user:
            return user['password']


def get_user():
    if collection_db.find_one({"email": get_jwt_identity()}):
        result = collection_db.find_one({"email": get_jwt_identity()})
        result['_id'] = str(result['_id'])
        return result
    elif collection_db.find_one({"phone_number": get_jwt_identity()}):
        result = collection_db.find_one({"phone_number": get_jwt_identity()})
        result['_id'] = str(result['_id'])
        return result


# sign up
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data['name']
    surname = data['surname']
    patronymic = data['patronymic']
    password = generate_password_hash(data['password'], method='sha256')
    phone_number = data.get('phone_number', '')
    email = data['email']
    avatar = 'user.svg'
    birthday = data.get('birthday', '')
    position = data.get("position", "")
    isDoctor = data.get('isDoctor', False)
    expirience = data.get('expirience')
    place = data.get('place')
    add_to_database(
        {'name': name, 'surname': surname, 'patronymic': patronymic, 'password': password, 'phone_number': phone_number,
         'email': email,
         'birthday': birthday, 'position': position, 'user_type': isDoctor, 'avatar': avatar, 'expirience': expirience,'place':place},
        'accounts')
    return jsonify({'message': 'User registered successfully'})


# log in
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    password = data['password']
    if data['email']:
        email = data['email']
        if check_password_hash(find_in_database(email=email), password):
            access_token = create_access_token(identity=email)
            return jsonify(access_token=access_token), 200
        else:
            return jsonify({'message': 'incorrect password'})
    elif data['phone_number']:
        phone_number = data['phone_number']
        if check_password_hash(find_in_database(phone_number=phone_number), password):
            access_token = create_access_token(identity=phone_number)
            return jsonify(access_token=access_token), 200
        else:
            return jsonify({'message': 'incorrect password'})
    else:
        return jsonify({'message': 'no email or phone_number'})


# add reference
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


# show references
@app.route('/show_references', methods=['POST'])
@jwt_required()
def show_ref():
    result = []
    user = reference_db.find({})
    for document in user:
        result.append(document)
    return jsonify({result})


# show doctors
@app.route('/show_doctor', methods=['POST'])
@jwt_required()
def show_doctor():
    result = []
    data = request.get_json()
    search_item = data.get('search_item')
    user = collection_db.find({
        "$or": [
            {"surname": {"$regex": search_item, "$options": "i"}},
            {"name": {"$regex": search_item, "$options": "i"}},
            {"patronymic": {"$regex": search_item, "$options": "i"}},
            {"position": {"$regex": search_item, "$options": "i"}}
        ]
    })
    for document in user:
        document['_id'] = str(document['_id'])
        result.append(document)
    return jsonify(result)


# get user by key
@app.route('/get_user_by_key', methods=['POST'])
@jwt_required()
def get_user():
    user = collection_db.find_one({"email": get_jwt_identity()})
    user['_id'] = str(user['_id'])
    return jsonify(user)


@app.route('/update_user', methods=['POST'])
@jwt_required()
def update_by_id():
    data = request.get_json()
    user = get_user()['_id']
    document = collection_db.find_one({'_id': user})
    for key in data.keys():
        document[key] = data[key]
    collection_db.update_one({'_id': user}, {'$set': document})

# send image
@app.route('/image/<image_name>', methods=['GET'])
def send_image(image_name):
    image_path = os.path.join(app.root_path, 'images', image_name)
    return send_file(image_path, as_attachment=True)

msgs = []

@socketio.on('connected')
def handle_connected(data):
    print('connect data user',data)
    join_room(data['room'])  # присоединяем пользователя к комнате с уникальным идентификатором

@socketio.on('message')
def handle_message(data):
    # db.messages.insert_one(data)  # сохраняем сообщение в MongoDB
    print('get message',data)
    msgs.append(data)
    emit('message', data, room=data['room'])  # отправляем сообщение только тем, кто в этой комнате

# start program
if __name__ == '__main__':
    socketio.run(app, allow_unsafe_werkzeug=True)