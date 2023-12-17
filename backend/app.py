import time

#import g4f
from io import BytesIO

import pytesseract as pytesseract
from PIL import Image
from bson import ObjectId
from flask import Flask, request, jsonify, send_file
from pymongo import MongoClient
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta
import os
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from flask_socketio import SocketIO, emit, join_room, leave_room

from gevent.pywsgi import WSGIServer
from geventwebsocket.handler import WebSocketHandler
import re

from ai.ai import Ai
import yake

cluster = MongoClient("mongodb://localhost:27017")
accounts_db = cluster["accounts"]
collection_db = accounts_db["accounts_collection"]
reference_db = accounts_db["reference_collection"]
message_db = accounts_db['chats']
history_db = accounts_db['history']

app = Flask(__name__)
CORS(app)
app.config['JWT_SECRET_KEY'] = 'your_secret_key'
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)
jwt = JWTManager(app)
socketio = SocketIO(app, cors_allowed_origins="*")
ai = Ai("C:/Users/Egor/Documents/GitHub/Telegram-RP-AI-Bot/models/wizardlm-1.0-uncensored-llama2-13b.Q4_K_M.gguf") #models/llama-2-7b-chat.ggmlv3.q4_1.bin

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

search_object_gpt = {"name": "Нейро", "surname": "мед-сестра", "email": "gpt@gpt.gpt"}
id_gpt = None

extractor = yake.KeywordExtractor(
    lan="ru",  # язык
    n=3,  # максимальное количество слов в фразе
    dedupLim=0.3,  # порог похожести слов
    top=10  # количество ключевых слов
)


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
    password = generate_password_hash(data['password'], method='pbkdf2:sha256')
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
        print('password',find_in_database(email=email), password)
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

@app.route('/image_to_text', methods=['POST'])
@jwt_required()
def upload_image():
    if 'image' in request.files:
        img_file = request.files['image']
        img = Image.open(BytesIO(img_file.read()))
        text = pytesseract.image_to_string(img)
        return jsonify({'text': text})
    else:
        return jsonify({'text': "No image provided in formdata"})

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


@app.route('/delete_reference', methods=['POST'])
@jwt_required()
def delete_ref():
    user_id = collection_db.find_one({"email": get_jwt_identity()})
    user_id = str(user_id.get('_id'))
    if user_id:
        data = request.get_json()
        reference_id = data.get('reference_id')
        if reference_id:
            print(reference_id)
            result = reference_db.delete_one({'_id': ObjectId(reference_id)})
            print('resutl delete',result)
            return jsonify({'message': 'Success!'}), 200
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
    #print(request.files.get("avatar").filename, request.files.get("avatar"))
    if request.files.get("avatar") != None:
        image = request.files['avatar']

        print('avatar::::::::::::::', image)
        path = os.path.join(app.root_path, 'images', image.filename)
        image.save(path)
        document['avatar'] = image.filename
        print(document)

    for key in data.keys():
        document[key] = data[key]

    collection_db.update_one({'_id': user}, {'$set': document})

    return jsonify({'message': 'User updated successfully'})


# send image
@app.route('/image/<image_name>', methods=['GET'])
def send_image(image_name):
    image_path = os.path.join(app.root_path, 'images', image_name)
    try:
        return send_file(image_path, as_attachment=True)
    except:
        print('not found')

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
    result = []
    user = collection_db.find_one({"email": get_jwt_identity()})
    user_id = str(user.get("_id"))
    messages = message_db.find({'users': {"$all":[user_id]}})
    for document in messages:
        document["_id"] = str(document["_id"])
        users = document["users"]
        ids = next((x for x in users if x != user_id), None)
        if ids == None:
            ids = user.get("_id")
        if users[0] == users[1]:
            ids = users[0]
        print('id get', ids, user.get("_id"))
        print('id get',ids, user.get("_id"))
        companion = collection_db.find_one({"_id": ObjectId(ids)})
        if companion:
            del companion['password']
            companion["_id"] = str(companion["_id"])
        print('cpmaneirnesrsefsefsefs',companion, ids)
        document['companion'] = companion
        result.append(document)
    chatGPTChat = message_db.find_one({'users': {"$all": [id_gpt,user_id]}})
    objectChatGpt = {'users': [id_gpt,user_id], 'messages': []}
    if not chatGPTChat:
        add_to_database(objectChatGpt, 'messages')
        chatGPTChat = message_db.find_one({'users': {"$all": [id_gpt, user_id]}})
        chatGPTChat['_id'] = str(chatGPTChat["_id"])
        result.append(chatGPTChat)
    print(result)
    return jsonify(result)


online_users = {}

def extract_text_inside_brackets(text):
    pattern = r"(\(.*?\))"
    result = re.search(pattern, text)
    if result:
        return result.group(1).replace("(","").replace(")","")
    else:
        return ""

@socketio.on('connected')
def handle_connected(data):
    print('=========== connected ===========')
    print('connect data user', data)
    data['user_id'] = str(data.get('user_id'))
    join_room(data.get('room'))  # присоединяем пользователя к комнате с уникальным идентификатором

    id_room = data.get('room')
    user_id = data.get('user_id')

    print("id room", id_room)
    print('user id', user_id)
    print('id gpt', id_gpt)

    if id_room == None or user_id == None:
        return

    room_obj = None
    if id_room:
        room_obj = collection_db.find_one({"_id": ObjectId(id_room)})

    user_obj = None
    if user_id:
        user_obj = collection_db.find_one({"_id": ObjectId(user_id)})
    if not room_obj or not user_obj:
        print("room obj", room_obj)
        print("user obj", user_obj)
        return
    print('id_room, user_id',id_room, user_id,id_room== user_id)
    if id_room == user_id:
        message_send = message_db.find_one({"users": [id_room, user_id]})
    else:
        message_send = message_db.find_one({"users": {"$all": [id_room, user_id]}})
    print('message send', message_send)
    if message_send:
        message_send['_id'] = str(message_send['_id'])
        emit('connected', message_send)

    online_users[request.sid] = {"_id": data.get('user_id'), "room": data.get('room')}
    print(online_users)

    emit('online', {"online": True, "user_id": str(data.get('user_id'))},
         room=online_users.get(request.sid).get('room'))
    if not message_send:
        print('try create')
        add_to_database({'users': [id_room, user_id], 'messages': []}, 'messages')


@socketio.on('disconnect')
def handle_disconnect():
    disconnected_user_id = request.sid
    print('disconnected_user_id', disconnected_user_id, online_users)
    user_data = online_users.get(request.sid)
    print('get data disconected', user_data)
    if user_data:
        emit('online', {"online": False, "user_id": str(user_data.get('user_id'))}, room=user_data.get('room'))
        online_users[request.sid] = False

def searchMainTopic(text, top=1):
    res = extractor.extract_keywords(text)
    res = res[:top]
    if len(res) > 0:
        return res[0]
    return ""

@socketio.on('message')
def handle_message(data):
    # add_to_database(data, 'messages')  # сохраняем сообщение в MongoDB
    print('get message', data)
    emit('message', data, room=data.get('room'))  # отправляем сообщение только тем, кто в этой комнате
    data['user_id'] = str(data.get('user_id'))
    data['date'] = time.time()
    data['role'] = "user"
    to_gpt = data["room"] == id_gpt
    clear_chat = data.get('clear')
    if to_gpt:
        data["content"] = data["text"]
    if clear_chat and to_gpt:
        message_db.update_one(
            {"users": {"$all": [data.get('room'), data.get("user_id")]}},
            {'$set': {'messages': []}}
        )
        print('clear send')
        emit('connected', [], room=data.get('room'))
        return
    print(data.get('user_id'))
    gpt_obj = None
    if to_gpt:
        get_message = message_db.find_one({"users": {"$all": [data.get('room'), data.get("user_id")]}})
        print('get mdgs', get_message)
        get_message['messages'].append(data)
        result = ai.generate('\n'.join(map(lambda message: message['text'], get_message.get("messages"))))
        # response = g4f.ChatCompletion.create(
        #     model=g4f.models.default,
        #     messages=get_message['messages'],
        #     # proxy="http://149.50.134.203:80",
        # )
        gpt_obj = {"role": "assistant", "content": result, "text": result, "date": time.time(), "user_id": id_gpt, "topic": searchMainTopic(result), "google": extract_text_inside_brackets(result)}
        print(get_message['messages'])
        print(result)
    # message_db.update_one({'user_id': data.get('user_id')}, {'$set': get_message})
    message_db.update_one(
        {"users": {"$all": [data.get('room'), data.get("user_id")]}},
        {'$push': {'messages': data}}
    )
    if to_gpt:
        message_db.update_one(
            {"users": {"$all": [data.get('room'), data.get("user_id")]}},
            {'$push': {'messages': gpt_obj}}
        )
        emit('message', gpt_obj, room=data.get('room'))


@socketio.on('join')
def join(message):
    username = message['username']
    room = message['room']
    join_room(room)
    print('RoomEvent: {} has joined the room {}\n'.format(username, room))
    emit('ready', {username: username}, to=room, skip_sid=request.sid)

@socketio.on('get_data')
def transfer_data(message):
    username = str(message.get('user_id'))
    room = message.get('room')
    data = message.get('data')
    print('DataEvent: {} has sent the data:\n {}\n'.format(username, data))
    emit('data', data, to=room, skip_sid=request.sid)


@socketio.on_error_default
def default_error_handler(e):
    print("Error: {}".format(e))
    socketio.stop()



@app.route('/add_to_history', methods=['POST'])
@jwt_required()
def add_to_history():
    user_email = get_jwt_identity()
    user_data = collection_db.find_one({"email": user_email})
    user_id = str(user_data['_id'])

    new_object = {'history': [], 'user_id': user_id}
    object = history_db.find_one({'user_id': user_id})

    if not object:
        new_object = {'history': [], 'user_id': user_id}
        history_db.insert(new_object)

    description = request.json['description']
    date = request.json['date']
    history_item = {'description': description, 'date': date}

    result = history_db.update_one(
        {'user_id': user_id},
        {'$push': {'history': history_item}}
    )

    return jsonify({"message": 'Object added to history successfully'}), 200

@app.route('/remove_from_history', methods=['POST'])
@jwt_required()
def remove_from_history():
    user_email = get_jwt_identity()
    user_data = collection_db.find_one({"email": user_email})
    user_id = str(user_data['_id'])
    description = request.json['description']
    date = request.json['date']

    result = history_db.update_one(
        {'user_id': user_id},
        {'$pull': {'history': {'description': description, 'date': date}}}
    )

    return jsonify({"message": 'Object removed from history successfully'}), 200

@app.route('/get_history', methods=['POST'])
@jwt_required()
def get_history():
    user_email = get_jwt_identity()
    user_data = collection_db.find_one({"email": user_email})

    if user_data:
        user_id = str(user_data.get("_id"))
        result = history_db.find_one({'user_id': user_id})

        if not result:
            new_object = {'history': [], 'user_id': user_id}
            history_db.insert_one(new_object)
            result = new_object
        if result.get("_id"):
            result["_id"] = str(result["_id"])
        print('resutttttt',result)
        return jsonify(result)

    return jsonify({})

def initGptUser():
    global id_gpt
    gpt_bot = collection_db.find_one(search_object_gpt)
    if not gpt_bot:
        add_to_database(
            {'name': "Нейро", 'surname': "мед-сестра", 'patronymic': "", 'password': "gpt_password",
             'phone_number': "",
             'email': "gpt@gpt.gpt",
             'birthday': "", 'position': "Нейро помощник", 'user_type': False, 'avatar': 'gpt.jpg',
             'expirience': "",
             'place': ""},
            'accounts')
        gpt_bot = collection_db.find_one(search_object_gpt)
        id_gpt = str(gpt_bot.get("_id"))
    else:
        id_gpt = str(gpt_bot.get("_id"))

# start program
if __name__ == '__main__':
    # socketio.run(app, allow_unsafe_werkzeug=True)
    initGptUser()
    http_server = WSGIServer(('127.0.0.1', 5000), app, handler_class=WebSocketHandler)
    http_server.serve_forever()
