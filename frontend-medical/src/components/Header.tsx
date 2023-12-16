import { useContext } from "react";
import UserContext from "../contexts/UserContext";
import { getImage } from "../utils/backend";
import { useNavigate } from "react-router-dom";

function Header() {
    const userData = useContext(UserContext);
    const navigate = useNavigate();

    return (
        <header className="h-[68px] flex flex-row justify-between items-center px-5 py-2 bg-white shadow-md fixed top-0 left-0 w-full z-[100]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 11.6661H8L10.0404 5L14.4382 19L15.9903 11.6661H20" stroke="#0067E2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <h1 className="text-black font-semibold mr-auto ml-5">Здоровье без границ</h1>
            {userData?.name &&
                <div className="flex flex-row items-center cursor-pointer" onClick={() => navigate('/user')}>
                    <h1 className="text-black font-semibold">{userData.surname} {userData.name}</h1>
                    <img
                        src={getImage(userData?.avatar)}
                        className="w-[42px] h-[42px] rounded-full ml-2"
                    />
                </div>
            }
        </header>
    )
}

export default Header;