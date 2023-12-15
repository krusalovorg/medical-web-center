import App from './App';
import Header from './components/Header';
import VerticalHeader from './components/VerticalHeader';
import { BrowserRouter, Route, Router, Routes } from 'react-router-dom';
import Chat from './pages/Chat';
import { useEffect, useState } from 'react';
import { getCookieToken } from './utils/backend';
import Login from './pages/Login';

function RouterNav() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        setIsLoggedIn(getCookieToken() ? true : false)
    }, [])

    return (
        <>
            <BrowserRouter>
                <Header />
                {
                    isLoggedIn ? <>
                        <VerticalHeader>
                            <Routes>
                                <Route path='/' element={<App />} />
                                <Route path='*' element={<App />} />
                                <Route path='/chats' element={<Chat />} />
                            </Routes>
                        </VerticalHeader>
                    </>
                        :
                        <Routes>
                            <Route path='/login' element={<Login />} />
                            <Route path='/reg' element={<Login reg />} />
                            <Route path='*' element={<Login />} />
                        </Routes>
                }
            </BrowserRouter>
        </>
    )
}

export default RouterNav;