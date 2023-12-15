function Header() {
    return (
        <header className="h-[68px] flex flex-row justify-between items-center px-5 py-2 bg-white shadow-md fixed top-0 left-0 w-full z-[1000]">
            <h1 className="text-black font-semibold">Медики онлайн</h1>
            <div className="flex flex-row items-center cursor-pointer">
                <h1 className="text-black font-semibold">Дудкин Егор</h1>
                <img
                    src="https://sun9-4.userapi.com/impg/TKkFV1S0TTKWi9-d49YO8q_ZMVlaliEETAZctQ/wSce4SocHD0.jpg?size=512x683&quality=95&sign=31012baaf0d0f6039c37d205054a34ad&type=album"
                    className="w-[42px] h-[42px] rounded-full ml-2"
                />
            </div>
        </header>
    )
}

export default Header;