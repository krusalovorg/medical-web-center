import { useState } from "react";
import SearchInput from "../components/SearchInput";
import UserMessage from "../components/UserMessage";
import Plus from "../icons/Plus";

function Chat() {
    const [selectId, setSelectId] = useState(1);
    return (
        <div className="w-full h-full flex flex-row justify-between align-top">
            <div className="h-full max-w-[550px] bg-white">
                <div className="bg-white h-[130px] flex justify-center items-center px-4 pt-[30px] relative">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 21L14.4457 16.3043H19C20.1046 16.3043 21 15.4089 21 14.3043V5C21 3.89543 20.1046 3 19 3H5C3.89543 3 3 3.89543 3 5V14.3043C3 15.4089 3.89543 16.3043 5 16.3043H9.75L12 21Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <h1 className="text-2xl text-black font-semibold ml-2 font-[Montserrat]">Чаты</h1>
                    <div className="border-b-4 border-[#0067E2] w-[90%] mx-auto mt-auto absolute bottom-0"></div>
                </div>
                <div className="bg-white h-[100px] px-4 py-[30px] flex flex-row justify-between gap-x-2">
                    <SearchInput />
                    <div className={`rounded-full flex justify-center items-center min-w-[48px] w-[48px] h-[48px] cursor-pointer text-white bg-[#0067E3]`} >
                        <Plus />
                    </div>
                </div>

                <div className="bg-[#F7F8FD] h-full px-4 gap-3">
                    <UserMessage
                        setId={setSelectId}
                        data={{
                            name: "Егор",
                            surname: "Дудкин",
                            select: selectId == 1,
                            id: 1,
                            text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.                        "
                        }} />
                    <UserMessage
                        setId={setSelectId}
                        data={{
                            name: "Егор",
                            surname: "Дудкин",
                            select: selectId == 2,
                            new_message: 1,
                            id: 2,
                            date: "14:56",
                            text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.                        "
                        }} />
                    <UserMessage
                        setId={setSelectId}
                        data={{
                            name: "Егор",
                            surname: "Дудкин",
                            select: selectId == 3,
                            id: 3,
                            text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.                        "
                        }} />
                    <UserMessage
                        setId={setSelectId}
                        data={{
                            name: "Егор",
                            surname: "Дудкин",
                            select: selectId == 4,
                            id: 4,
                            text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.                        "
                        }} />
                </div>
            </div>
            <div className="w-full h-full flex justify-center items-center">
                <div className="w-[90%] h-[90%] bg-[#F5FAFD] rounded-3xl relative">
                    <div className="w-full bg-white h-[80px] rounded-t-3xl flex flex-row items-center px-5">
                        <img
                            src="https://sun9-4.userapi.com/impg/TKkFV1S0TTKWi9-d49YO8q_ZMVlaliEETAZctQ/wSce4SocHD0.jpg?size=512x683&quality=95&sign=31012baaf0d0f6039c37d205054a34ad&type=album"
                            className={`min-w-[56px] h-[56px] rounded-full`}
                        />
                        <div className="ml-5 gap-2">
                            <h1 className={`text-xl text-black font-[Montserrat]`}>
                                Дудкин Егор
                            </h1>
                            <h2 className={`text-black ml-auto font-[Montserrat]`}>в сети</h2>
                        </div>
                    </div>
                    <div className="w-full h-full overflow-scroll overflow-x-hidden px-5 flex gap-4 flex-col" style={{
                        height: "calc(100% - 200px)"
                    }}>
                        <div className="h-5"/>
                        <div className="max-w-[70%] w-fit bg-white shadow-md rounded-2xl p-7">
                            Добрый день Егор, как себя чувствуете?
                        </div>
                        <div className="max-w-[70%] w-fit bg-white shadow-md rounded-2xl p-7 ml-auto">
                            Отлично ПРЕКРАСНо спасибо !
                        </div>
                        <div className="max-w-[70%] w-fit bg-white shadow-md rounded-2xl p-7">
                            Добрый день Егор, как себя чувствуете?
                        </div>
                        <div className="max-w-[70%] w-fit bg-white shadow-md rounded-2xl p-7 ml-auto">
                            Отлично ПРЕКРАСНо спасибо !
                        </div>
                        <div className="max-w-[70%] w-fit bg-white shadow-md rounded-2xl p-7">
                            Добрый день Егор, как себя чувствуете?
                        </div>
                        <div className="max-w-[70%] w-fit bg-white shadow-md rounded-2xl p-7 ml-auto">
                            Отлично ПРЕКРАСНо спасибо !
                        </div>
                        <div className="max-w-[70%] w-fit bg-white shadow-md rounded-2xl p-7">
                            Добрый день Егор, как себя чувствуете?
                        </div>
                        <div className="max-w-[70%] w-fit bg-white shadow-md rounded-2xl p-7 ml-auto">
                            Отлично ПРЕКРАСНо спасибо !
                        </div>
                        <div className="max-w-[70%] w-fit bg-white shadow-md rounded-2xl p-7">
                            Добрый день Егор, как себя чувствуете?
                        </div>
                        <div className="max-w-[70%] w-fit bg-white shadow-md rounded-2xl p-7 ml-auto">
                            Отлично ПРЕКРАСНо спасибо !
                        </div>
                        <div className="max-w-[70%] w-fit bg-white shadow-md rounded-2xl p-7">
                            Добрый день Егор, как себя чувствуете?
                        </div>
                        <div className="max-w-[70%] w-fit bg-white shadow-md rounded-2xl p-7 ml-auto">
                            Отлично ПРЕКРАСНо спасибо !
                        </div>
                        <div className="max-w-[70%] w-fit bg-white shadow-md rounded-2xl p-7">
                            Добрый день Егор, как себя чувствуете?
                        </div>
                        <div className="max-w-[70%] w-fit bg-white shadow-md rounded-2xl p-7 ml-auto">
                            Отлично ПРЕКРАСНо спасибо !
                        </div>
                        <div className="max-w-[70%] w-fit bg-white shadow-md rounded-2xl p-7">
                            Добрый день Егор, как себя чувствуете?
                        </div>
                        <div className="max-w-[70%] w-fit bg-white shadow-md rounded-2xl p-7 ml-auto">
                            Отлично ПРЕКРАСНо спасибо !
                        </div>
                        <div className="max-w-[70%] w-fit bg-white shadow-md rounded-2xl p-7">
                            Добрый день Егор, как себя чувствуете?
                        </div>
                        <div className="max-w-[70%] w-fit bg-white shadow-md rounded-2xl p-7 ml-auto">
                            Отлично ПРЕКРАСНо спасибо !
                        </div>
                        <div className="max-w-[70%] w-fit bg-white shadow-md rounded-2xl p-7">
                            Добрый день Егор, как себя чувствуете?
                        </div>
                        <div className="max-w-[70%] w-fit bg-white shadow-md rounded-2xl p-7 ml-auto">
                            Отлично ПРЕКРАСНо спасибо !
                        </div>

                    </div>
                    <div className="w-[94%] mx-[3%] px-6 bg-white h-[75px] shadow-md rounded-3xl flex flex-row items-center absolute bottom-0 mb-5">
                        <input
                            type="text"
                            className="border-none h-full focus:outline-none w-full bg-transparent placeholder-text-[#C9CBD2] font-[Montserrat]"
                            placeholder='Введите сообщение...'
                        />
                        <div className="bg-[#0067E2] cursor-pointer rounded-xl w-[200px] h-[40px] text-white font-[Montserrat] font-semibold flex justify-center items-center">
                            Отправить
                            <svg className="ml-2" width="26" height="24" viewBox="0 0 26 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M24.3124 12L11.673 12M6.34676 16.1693H3.91245M6.34676 12.1464H1.51245M6.34676 8.12356H3.91245M10.6198 4.59596L23.8752 11.0228C24.6915 11.4186 24.6915 12.5814 23.8752 12.9772L10.6198 19.4041C9.71176 19.8443 8.74657 18.9161 9.15107 17.9915L11.5819 12.4353C11.7033 12.1578 11.7033 11.8422 11.5819 11.5647L9.15107 6.00848C8.74657 5.08391 9.71176 4.15568 10.6198 4.59596Z" stroke="white" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Chat;