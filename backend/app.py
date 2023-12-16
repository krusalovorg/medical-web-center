from flask import Flask, request, jsonify, send_file
from pymongo import MongoClient
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta
import os
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from flask_socketio import SocketIO, emit, join_room, leave_room
from werkzeug.utils import secure_filename

from gevent.pywsgi import WSGIServer
from geventwebsocket.handler import WebSocketHandler

cluster = MongoClient("mongodb://localhost:27017")
accounts_db = cluster["accounts"]
collection_db = accounts_db["accounts_collection"]
reference_db = accounts_db["reference_collection"]
message_db = accounts_db['chats']

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
    elif db == 'messages':
        message_db.insert_one(data)


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
         'birthday': birthday, 'position': position, 'user_type': isDoctor, 'avatar': avatar, 'expirience': expirience,
         'place': place},
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
    date = request.form.get('date')
    name = request.form.get('name')
    image_filename = ""
    print(date, )
    if request.files.get("image", False):
        image = request.files['image']
        print('image', image)
        path = os.path.join(app.root_path, 'images', image.filename)
        image.save(path)
        image_filename = image.filename
    if collection_db.find_one({"email": get_jwt_identity()}):
        person_id = collection_db.find_one({"email": get_jwt_identity()})['_id']
    elif collection_db.find_one({"phone_number": get_jwt_identity()}):
        person_id = collection_db.find_one({"phone_number": get_jwt_identity()})['_id']
    else:
        return jsonify({'message': 'user not found'})

    add_to_database({'user_id': person_id, 'date': date, 'image': image_filename, 'name': name}, 'references')
    return jsonify({'message': 'добавленно в таблицу '})


# show references
@app.route('/show_references', methods=['POST'])
@jwt_required()
def show_ref():
    result = []
    user_id = collection_db.find_one({"email": get_jwt_identity()}).get('_id')
    if user_id:
        user = reference_db.find({'user_id': user_id})
        for document in user:
            result.append(document)
            document["_id"] = str(document['_id'])
            document['user_id'] = str(document['user_id'])
        print('resukt', result)
        return jsonify(result)
    return []

@app.route('/delete_reference', methods=['DELETE'])
@jwt_required()
def delete_ref():
    user_id = collection_db.find_one({"email": get_jwt_identity()}).get('_id')
    if user_id:
        data = request.get_json()
        reference_id = data.get('reference_id')
        if reference_id:
            result = reference_db.delete_one({'_id': reference_id})
            if result.deleted_count > 0:
                return jsonify({'message': 'Reference deleted successfully.'}), 200
            else:
                return jsonify({'error': 'Reference not found or you do not have permission to delete it.'}), 404
        else:
            return jsonify({'error': 'Invalid reference_id in request body.'}), 400
    else:
        return jsonify({'error': 'User not found.'}), 404

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
    del user['password']
    print('user', user, get_jwt_identity())
    return jsonify(user)


@app.route('/update_user', methods=['POST'])
@jwt_required()
def update_by_id():
    data = request.form

    user = collection_db.find_one({"email": get_jwt_identity()})['_id']
    print('get user', user)
    document = collection_db.find_one({'_id': user})
    print('document', document)
    print('data gety', request.files.get("image"))
    print(request.files.get("avatar").filename, request.files.get("avatar"))
    if request.files.get("avatar") != None:
        image = request.files['avatar']

        print('avatar::::::::::::::', image)
        path = os.path.join(app.root_path, 'images', image.filename)
        image.save(path)
        document['avatar'] = image.filename
        print(document)

    for key in data.keys():
        if document[key] is not None:
            document[key] = data[key]

    collection_db.update_one({'_id': user}, {'$set': document})

    return jsonify({'message': 'User updated successfully'})


# send image
@app.route('/image/<image_name>', methods=['GET'])
def send_image(image_name):
    image_path = os.path.join(app.root_path, 'images', image_name)
    return send_file(image_path, as_attachment=True)


@app.route('/show_messages', methods=['POST'])
@jwt_required()
def show_mess():
    data = request.form
    result = []
    messages = reference_db.find({'user_id': data.get('user_id'), 'room': data.get('room')})
    for document in messages:
        result.append(document)
    return jsonify(result)


@app.route('/show_chats', methods=['POST'])
@jwt_required()
def show_chat():
    data = request.form
    result = []
    messages = reference_db.find({'user_id': data.get('user_id')})
    for document in messages:
        result.append(document)
    return jsonify(result)


online_users = {}


@socketio.on('connected')
def handle_connected(data):
    print('connect data user', data)
    data['user_id'] = str(data.get('user_id'))
    join_room(data.get('room'))  # присоединяем пользователя к комнате с уникальным идентификатором

    message_send = message_db.find_one({"users": {"$all": [data.get('room'), data.get("user_id")]}})
    print('message send',message_send)
    if message_send:
        message_send['_id'] = str(message_send['_id'])
        emit('connected', message_send)

    online_users[request.sid] = {"_id": data.get('user_id'), "room": data.get('room')}
    print(online_users)

    emit('online', {"online": True, "user_id": str(data.get('user_id'))}, room=online_users.get(request.sid).get('room'))
    print('findeddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',message_send)
    if not message_send:
        print('try create')
        add_to_database({'users': [data.get('user_id'), data.get('room')], 'messages': []}, 'messages')


@socketio.on('disconnect')
def handle_disconnect():
    disconnected_user_id = request.sid
    print('disconnected_user_id', disconnected_user_id, online_users)
    user_data = online_users.get(request.sid)
    print('get data disconected',user_data)
    if user_data:
        emit('online', {"online": False, "user_id": str(user_data.get('user_id'))}, room=user_data.get('room'))
        online_users[request.sid] = False


@socketio.on('message')
def handle_message(data):
    # add_to_database(data, 'messages')  # сохраняем сообщение в MongoDB
    print('get message', data)
    emit('message', data, room=data.get('room'))  # отправляем сообщение только тем, кто в этой комнате
    data['user_id'] = str(data.get('user_id'))
    print(data.get('user_id'),)
    get_message = message_db.find_one({"users": {"$all": [data.get('room'), data.get("user_id")]}})
    print('get mdgs',get_message)
    get_message['messages'].append(data)
    # message_db.update_one({'user_id': data.get('user_id')}, {'$set': get_message})
    message_db.update_one(
        {"users": {"$all": [data.get('room'), data.get("user_id")]}},
        {'$push': {'messages': data}}
    )


# start program
if __name__ == '__main__':
    # socketio.run(app, allow_unsafe_werkzeug=True)
    http_server = WSGIServer(('127.0.0.1', 5000), app, handler_class=WebSocketHandler)
    http_server.serve_forever()
