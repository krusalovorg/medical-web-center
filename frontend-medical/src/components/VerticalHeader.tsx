import { useNavigate } from 'react-router-dom';
import MailIcon from '../icons/mail.svg';
import Mail from '../icons/Mail';
import User from '../icons/User';

function VerticalHeader({ children }: any) {
    const navigate = useNavigate();
    const url = window.location.pathname;

    return (
        <div className="h-screen flex flex-row align-top z-100">
            <header className="w-[100px] h-full flex fixed left-0 flex-col justify-start items-center px-5 bg-white shadow-sm pt-[80px]">
                <div onClick={() => navigate("/user")} className={`p-[20px] rounded-full cursor-pointer ${url == '/user' ? 'text-white bg-[#0067E3]' : 'text-black'}`} >
                    <User />
                </div>
                <div onClick={() => navigate("/chats")} className={`p-[20px] rounded-full cursor-pointer ${url == '/chats' ? 'text-white bg-[#0067E3]' : 'text-black'}`} >
                    <Mail />
                </div>
            </header>
            <div className='w-[100px]'></div>
            <div className='w-full pt-[68px]'>
                {children}
            </div>
        </div>
    )
}

export default VerticalHeader;