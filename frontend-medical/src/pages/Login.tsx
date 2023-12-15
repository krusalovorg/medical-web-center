import React, { useState, useEffect } from 'react';
import { URL_SERVER, getCookieToken } from '../utils/backend';
import { useNavigate } from 'react-router-dom';

function Login({ reg }: any) {
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [patronymic, setPatronymic] = useState('');

    const [position, setPosition] = useState('');

    const [imDoctor, setImDoctor] = useState(false);

    const [email, setEmail] = useState('');

    const [password, setPassword] = useState('');
    const [passwordRepeat, setPasswordRepeat] = useState('');
    const [error, setError] = useState('');
    const [token, setToken] = useState('');

    useEffect(() => {
        const cookieToken = getCookieToken();
        if (cookieToken) {
            setToken(cookieToken.split('=')[1]);
        }
    }, []);

    const handleLogin = () => {
        fetch(URL_SERVER + '/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })
            .then(response => {
                if (response.status === 200) {
                    return response.json();
                } else {
                    throw new Error('Неверный логин или пароль');
                }
            })
            .then(data => {
                // Сохраняем токен в куки
                document.cookie = `access_token = ${data.access_token}`;
                console.log("GET DATA",data)
                setToken(data.access_token);
                window.location.reload();
            })
            .catch(error => {
                setError(error.message);
            });
    }

    const registerUser = () => {
        const userData = {
            name,
            surname,
            patronymic,
            password,
            // phone_number: 'Телефон',
            email,
            // birthday: 'Дата рождения',
            position,
            user_type: imDoctor
        }
        fetch(URL_SERVER+'/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        })
            .then(response => response.json())
            .then(data => {
                console.log('User registered successfully:', data);
                navigate('/login')
            })
            .catch(error => {
                console.error('Error registering user:', error);
            });
    }

    return (
        <>
            <div className={` ${!token && 'flex justify-center items-center'}`} style={{
                minHeight: 'calc(100vh - 70px)',
                marginTop: 70
            }}>
                <div className='w-full max-w-lg px-10 py-8 mx-auto bg-white border shadow-sm rounded-2xl'>
                    <div className='max-w-md mx-auto space-y-3'>
                        <h3 className="text-lg font-semibold text-center">{reg ? "Регистрация" : "Вход"}</h3>
                        {
                            reg ?
                                <>
                                    <div>
                                        <label className="block py-1">Имя</label>
                                        <input
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            type={reg ? "name" : "email"}
                                            className="border w-full py-2 px-2  outline-none rounded-lg ring-inset ring-gray-300 pl-4 font-[Montserrat]" />
                                    </div>
                                    <div>
                                        <label className="block py-1">Фамилия</label>
                                        <input
                                            value={surname}
                                            onChange={(e) => setSurname(e.target.value)}
                                            type="surname"
                                            className="border w-full py-2 px-2  outline-none rounded-lg ring-inset ring-gray-300 pl-4 font-[Montserrat]" />
                                    </div>
                                    <div>
                                        <label className="block py-1">Отчество</label>
                                        <input
                                            value={patronymic}
                                            onChange={(e) => setPatronymic(e.target.value)}
                                            type="patronymic"
                                            className="border w-full py-2 px-2  outline-none rounded-lg ring-inset ring-gray-300 pl-4 font-[Montserrat]" />
                                    </div>
                                </> :
                                <></>
                        }
                        <div>
                            <label className="block py-1">Почта</label>
                            <input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                type={"email"}
                                className="border w-full py-2 px-2  outline-none rounded-lg ring-inset ring-gray-300 pl-4 font-[Montserrat]" />
                        </div>
                        <div>
                            <label className="block py-1">Пароль</label>
                            <input
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                type="password"
                                className="border w-full py-2 px-2  outline-none rounded-lg ring-inset ring-gray-300 pl-4 font-[Montserrat]" />
                        </div>
                        {
                            reg ? <>
                                <div>
                                    <label className="block py-1">Повторите пароль</label>
                                    <input
                                        value={passwordRepeat}
                                        onChange={(e) => setPasswordRepeat(e.target.value)}
                                        type="password"
                                        className="border w-full py-2 px-2  outline-none rounded-lg ring-inset ring-gray-300 pl-4 font-[Montserrat]" />
                                </div>
                                <div
                                    onClick={() => setImDoctor(!imDoctor)}
                                    className={`w-full h-[60px] cursor-pointer shadow-md flex justify-center items-center rounded-2xl ${imDoctor && "bg-[#0067E3] text-white"}`}>
                                    Я врач
                                </div>
                                {
                                    imDoctor ?
                                        <div>
                                            <label className="block py-1">Должность</label>
                                            <input
                                                value={position}
                                                onChange={(e) => setPosition(e.target.value)}
                                                type="text"
                                                className="border w-full py-2 px-2  outline-none rounded-lg ring-inset ring-gray-300 pl-4 font-[Montserrat]" />
                                        </div>
                                        : <></>
                                }
                            </>
                                : <></>
                        }
                        {error && <p className="text-red-500">{error}</p>}
                        <div className="flex gap-3 pt-3 items-center justify-center">
                            <button
                                onClick={reg ? registerUser : handleLogin}
                                className="border px-4 py-2 font-[Montserrat] rounded-lg ring-inset ring-gray-300 ">{reg ? "Создать аккаунт" : "Войти"}</button>
                        </div>
                        <p className='text-center font-[Montserrat]'>
                            {reg ? "У вас уже есть аккаунт?" : "У вас нет аккаунта?"} <span className='text-[#0067E3] cursor-pointer' onClick={() => navigate(reg ? '/login' : '/reg')}>{reg ? "Тогда войдите в него!" : "Тогда создайте его!"}</span>
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Login;