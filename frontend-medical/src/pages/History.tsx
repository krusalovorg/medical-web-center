import { useContext, useEffect, useRef, useState } from "react";
import SearchInput from "../components/SearchInput";
import UserMessage from "../components/UserMessage";
import Plus from "../icons/Plus";
import { URL_SERVER, UserData, getCookieToken, getDoctors, getImage, getUserData } from "../utils/backend";
import Input from "../components/Input";
import UserContext from "../contexts/UserContext";
import moment from "moment";

function History() {
    const [description, setDescription] = useState('');
    const [date, setDate] = useState<any>(null);
    const [data, setData] = useState<any>({ history: [], user_id: '' });
    const ref = useRef(null);

    const userData = useContext(UserContext);

    // Отправка нового объекта
    const addObject = async () => {
        if (description.length > 3) {
            const response = await fetch(URL_SERVER + '/add_to_history', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getCookieToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ description, date })
            });
            const data = await response.json();
            setDescription('');
            console.log(data);
            getHistory();
        }
    };

    // Удаление
    const removeObject = async (obj: any) => {
        const response = await fetch(URL_SERVER + '/remove_from_history', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getCookieToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(obj)
        });
        const data = await response.json();
        setDescription('');
        console.log(data);
        getHistory();
    };
    // Получение истории
    const getHistory = async () => {
        const response = await fetch(URL_SERVER + '/get_history', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getCookieToken()}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        setData(data)
        console.log(data);
    };

    useEffect(() => {
        getHistory();
    }, [])

    return (
        <div className="w-full h-full flex justify-center align-center">
            <div className="w-full h-full flex justify-center items-center">
                <div className="w-[90%] h-[90%] bg-[#F5FAFD] rounded-3xl relative">
                    <div className="w-full bg-white h-[80px] rounded-t-3xl flex flex-row items-center px-5 mb-5">
                        <div className="ml-5 gap-2">
                            <h1 className={`text-xl text-black font-[Montserrat]`}>
                                Ваша история болезней
                            </h1>
                        </div>
                    </div>
                    <div className="px-[3%] pt-2 flex flex-col w-full">
                        {data && data?.history?.length > 0 ? data?.history?.map((item: any) =>
                            <div className="shadow-sm flex flex-col justify-start items-start w-[80%] bg-white p-5 mx-auto rounded-xl mb-3">
                                <h1 className="text-black font-[Montserrat]">{item.description}</h1>
                                <div className="flex flex-row border-t-[1px] w-full border-[#E8E9EA] pt-2 mt-2">
                                    <h2 className="ml-auto text-[#b8b8b8] font-[Montserrat]">{item?.date}</h2>
                                    <svg onClick={() => removeObject(item)} className="ml-2 cursor-pointer" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M4 6.17647H20M9 3H15M10 16.7647V10.4118M14 16.7647V10.4118M15.5 21H8.5C7.39543 21 6.5 20.0519 6.5 18.8824L6.0434 7.27937C6.01973 6.67783 6.47392 6.17647 7.04253 6.17647H16.9575C17.5261 6.17647 17.9803 6.67783 17.9566 7.27937L17.5 18.8824C17.5 20.0519 16.6046 21 15.5 21Z" stroke="#b8b8b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        )
                            :
                            <h1 className="text-black font-[Montserrat] text-center text-xl">Сейчас ваша история пустая</h1>
                        }
                    </div>
                    <div className="w-[94%] mx-[3%] px-6 bg-white h-[75px] shadow-md rounded-3xl flex flex-row items-center absolute bottom-0 mb-5">
                        <input
                            type="text"
                            className="border-none h-full focus:outline-none w-full bg-transparent placeholder-text-[#C9CBD2] font-[Montserrat]"
                            placeholder='Введите болезнь...'
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <input
                            type="date"
                            value={date}
                            ref={ref}
                            onClick={() => {
                                if (ref.current) {
                                    (ref.current as any).showPicker();
                                }
                            }}
                            onChange={(e: any) => setDate(e.target.value)}
                            className="ml-auto border-[#0067E3] border-2 px-3 rounded-xl w-[200px] h-[40px] cursor-pointer focus:outline-none mr-2 bg-transparent placeholder-text-[#C9CBD2] font-[Montserrat]"
                            placeholder="ДД.ММ.ГГГГ"
                        />
                        <div
                            onClick={() => addObject()}
                            className="bg-[#0067E2] cursor-pointer rounded-xl w-[200px] h-[40px] text-white font-[Montserrat] font-semibold flex justify-center items-center">
                            Добавить
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

export default History;