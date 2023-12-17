import { useContext, useEffect, useReducer, useRef, useState } from "react";
import SearchInput from "../components/SearchInput";
import UserMessage from "../components/UserMessage";
import Plus from "../icons/Plus";
import { UserData, getChats, getCookieToken, getDoctors, getImage, getPositions, getUserData } from "../utils/backend";
import socketIOClient from 'socket.io-client';
import Modal from "../components/Modal";
import { io } from "socket.io-client";
import UserContext from "../contexts/UserContext";
import moment from "moment";
import CallModal from "../components/CallModal";
import { Dropdown } from 'flowbite-react';

const ENDPOINT = "http://127.0.0.1:5000";

function Chat() {
    const [searchText, setSearchText] = useState('');
    const [doctorsSearch, setDoctorsSearch] = useState<UserData[]>([]);
    const [renderDoctors, setRenderDoctors] = useState();
    const [doctorsSearchModal, setDoctorsSearchModal] = useState<UserData[]>([]);
    const [searchTextModal, setSearchTextModal] = useState('');

    const ref = useRef<HTMLDivElement>(null);

    const [allChats, setAllChats] = useState<any[]>([]);

    const [open, setOpen] = useState(false);

    const [callOpen, setCallOpen] = useState(false);

    const [selectCreateChatUser, setSelectCreateChatUser] = useState<any>(0);
    const [selectCreateChatUserData, setSelectCreateChatUserData] = useState<any>({});

    const [selectedUserChat, setSelectedUserChat] = useState<UserData>({} as any);

    const [text, setText] = useState<string>("");
    const [messages, setMessages] = useState<any>([]);

    const [selectPosition, setSelectPosition] = useState<string>("");

    const [onlineUser, setOnlineUser] = useState(false);

    const userData = useContext(UserContext);

    const [selectId, setSelectId] = useState<any>(null);

    const [allDoctors, setAllDoctors] = useState<UserData[]>([]);
    const [doctroPositions, setDoctroPositions] = useState<string[]>([]);

    const [loading, setLoading] = useState(false);

    async function loadUser() {
        const token = getCookieToken();
        if (token) {
            const user = await getUserData(token);
            console.log('user', user, selectId)
            setSelectedUserChat(user)
        }
    }

    useEffect(() => {
        //loadUser();
    }, [selectId])


    useEffect(() => {
        const socket = io(ENDPOINT, {autoConnect: true});
        console.log('CREATE NEW CONNECTION', selectId, userData?._id)

        socket.emit('connected', { room: selectId, user_id: userData._id });
        console.log("TRY SWEND CONNECTEDTIONDEONSFOENEONF::::::::::::::::")
        
        setTimeout(() => socket.emit('connected', { room: selectId, user_id: userData._id }), 500);

        socket.on('connected', (data) => {
            console.log('get data:::::::', data);
            setMessages(data?.messages);
            setTimeout(() => scrollBottom(), 200);
        });

        socket.on('message', (message: any) => {
            console.log('get data:', message, messages);
            setMessages((prevMessages: any) => ([...prevMessages, message]));
            setTimeout(() => scrollBottom(), 200);
            setLoading(false);
        });

        socket.on('online', (online: any) => {
            console.log('getonline', online)
            if (online.user_id === userData._id) {
                setOnlineUser(online?.online);
            }
        });

        // socket.on('typing', (typing) => {
        //     // обработка события typing
        // });

        return () => {
            console.log("DISCONNECT")
            socket.disconnect();
        };
    }, [selectId]);

    const sendMessage = () => {
        if (text.length > 0) {
            const socket = io(ENDPOINT);
            console.log('send data::::', selectId, userData?._id, { room: selectId, text: text, user_id: userData._id })
            socket.emit('message', { room: selectId, text: text, user_id: userData._id });
            if (selectedUserChat?.avatar == 'gpt.jpg') {
                setLoading(true);
            }
            setText("");  // Очистить поле ввода после отправки
        }
        scrollBottom()
    };

    const clearChat = () => {
        const socket = io(ENDPOINT);
        console.log('usrsS::::', selectId, userData?._id)
        socket.emit('message', { room: selectId, text: text, user_id: userData._id, clear: true });
        setText("");  // Очистить поле ввода после отправки
    };

    function scrollBottom() {
        if (ref.current) {
            // (ref.current as any)?.scrollIntoView({ behavior: "smooth", block: "end"});
            ref.current.scrollTo(9999999, 9999999);
        }
    }

    async function loadModal() {
        if (searchTextModal.length > 0) {
            const res = await getDoctors(searchTextModal);
            setDoctorsSearchModal(res);
            // setDoctorsSearch(res);
        } else {
            setDoctorsSearchModal([]);
            // setDoctorsSearch([]);
        }
    }
    async function load() {
        if (searchText.length > 0) {
            const res = await getDoctors(searchText);
            setDoctorsSearch(res);
        } else {
            setDoctorsSearch([]);
        }
    }

    async function loadChats() {
        const res = await getChats();
        console.log('res', res)
        setAllChats(res);
        console.log('resultttttttttttttttttttttttt', res.length > 0, selectId, selectId == null)
        if (res.length > 0 && selectId == null) {
            const item: any = res[0];
            let id_room = item?.users?.find((x: any) => x !== userData?._id);
            if (item?.users[0] == item?.users[1]) {
                id_room = item?.users[0]
            }
            console.log('sett id', id_room, item)
            setSelectId(id_room)
            setMessages(item?.messages)
            setSelectedUserChat(item?.companion)
        } else if (!selectId) {
            setSelectId(userData?._id)
            setSelectedUserChat(userData)
        }
    }

    useEffect(() => {
        loadModal()
    }, [searchTextModal])

    useEffect(() => {
        load()
    }, [searchText])

    useEffect(() => {
        loadChats();
        scrollBottom()
    }, [selectId, selectedUserChat])

    async function loadDoctorsAll() {
        if (open) {
            setAllDoctors(await getDoctors(""));
        } else {
            setAllDoctors([])
            setSearchTextModal('');
        }
        if (doctroPositions.length == 0) {
            setDoctroPositions(await getPositions());
        }
    }

    useEffect(() => {
        loadDoctorsAll()
    }, [open])

    useEffect(() => {
        if (callOpen) {
            const socket = io(ENDPOINT);
            socket.emit('message', { room: selectId, text: '', user_id: userData._id, call: true, call_date: moment().format("DD.MM.YYYY HH:mm") });
            return () => {
                socket.disconnect();
            };    
        }
    }, [callOpen])

    useEffect(() => {
        loadChats();
        scrollBottom();
    }, [])
    return (
        <>
            <Modal
                open={open}
                setOpen={setOpen}
                title={"Выбрать участника"}>
                <div className="mt-2">
                    <SearchInput onChange={setSearchTextModal} />
                    <Dropdown
                        label={selectPosition || "Выбрать специалиста"}
                        style={{
                            width: "100%",
                            marginTop: 8,
                            border: 'none',
                            background: "#F5FAFD",
                            color: "black",
                            height: 48
                        }}
                        className="w-auto rounded-lg text-center"
                        dismissOnClick={true}>
                        {
                            doctroPositions && doctroPositions.length > 0 && doctroPositions.map((item) => {
                                if (item == '') {
                                    return <></>
                                }
                                return <Dropdown.Item onClick={() => {
                                    setSearchTextModal(item)
                                    setSelectPosition(item);
                                }} value={item}>{item}</Dropdown.Item>
                            })
                        }
                    </Dropdown>

                    <div className="h-[500px] mt-5">
                        {
                            <>
                                {(doctorsSearchModal?.length > 0 ? doctorsSearchModal : allDoctors).map((item, index: number) =>
                                    <UserMessage
                                        setId={setSelectCreateChatUser}
                                        setData={setSelectCreateChatUserData}
                                        data={{
                                            select: selectCreateChatUser == item?._id,
                                            id: item?._id,
                                            ...item
                                        }} />)}
                            </>
                        }
                    </div>
                    {selectCreateChatUser ?
                        <button
                            onClick={() => {
                                setOpen(false)
                                setSelectId(selectCreateChatUser)
                                setSelectedUserChat(selectCreateChatUserData)
                                console.log(selectCreateChatUserData)
                            }}
                            className="outline-none border-none w-full h-[68px] bg-[#0067E3] text-white text-xl rounded-xl">
                            Выбрать
                        </button>
                        : <></>
                    }
                </div>
            </Modal>
            <CallModal
                open={callOpen}
                onClose={() => {
                    const socket = io(ENDPOINT);
                    socket.emit('message', { room: selectId, text: '', user_id: userData._id, call: false, call_date: moment().format("DD.MM.YYYY HH:mm") });
                    socket.disconnect()
                }}
                setOpen={setCallOpen}
                selectUserData={selectedUserChat} />
            <div className="w-full h-full flex flex-row justify-between align-top overflow-y-hidden">
                <div className="h-full max-w-[550px] bg-white">
                    <div className="bg-white h-[130px] flex justify-center items-center px-4 pt-[30px] relative">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 21L14.4457 16.3043H19C20.1046 16.3043 21 15.4089 21 14.3043V5C21 3.89543 20.1046 3 19 3H5C3.89543 3 3 3.89543 3 5V14.3043C3 15.4089 3.89543 16.3043 5 16.3043H9.75L12 21Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        <h1 className="text-2xl text-black font-semibold ml-2 font-[Montserrat]">Чаты</h1>
                        <div className="border-b-4 border-[#0067E2] w-[90%] mx-auto mt-auto absolute bottom-0"></div>
                    </div>
                    <div className="bg-white h-[100px] px-4 py-[30px] flex flex-row justify-between gap-x-2">
                        <SearchInput onChange={setSearchText} />
                        <div
                            onClick={() => {
                                setOpen(true)
                            }}
                            className={`rounded-full flex justify-center items-center min-w-[48px] w-[48px] h-[48px] cursor-pointer text-white bg-[#0067E3]`} >
                            <Plus />
                        </div>
                    </div>

                    <div className="bg-[#F7F8FD] h-full px-4 gap-3">
                        {allChats?.length > 0 && allChats.map((item, index: number) => {
                            const newestObject = item?.messages.reduce((max: any, obj: any) => (obj.date > max.date ? obj : max), item?.messages[0]);
                            let id_room = item?.users?.find((x: any) => x !== userData?._id);
                            if (item?.users[0] == item?.users[1]) {
                                id_room = item?.users[0]
                            }
                            return <UserMessage
                                setId={setSelectId}
                                setData={(d: any) => {
                                    setSelectedUserChat(d);
                                    setMessages(item?.messages)
                                }}
                                data={{
                                    select: selectId == id_room,
                                    id: id_room,
                                    text: newestObject?.text,
                                    date: moment(newestObject?.date).format("HH:mm"),
                                    ...item.companion
                                }} />
                        }
                        )}
                        {(doctorsSearch?.length > 0 || searchText) && !open &&
                            <>
                                <h1 className={`text-lg text-black font-[Montserrat] mb-2 px-2 py-4 border-b-2 border-b-[#E8E9EA]`}>
                                    Найдено результатов: {doctorsSearch?.length}
                                </h1>
                                {doctorsSearch?.length > 0 && doctorsSearch.map((item: any, index: number) => {
                                    return <UserMessage
                                        setId={setSelectId}
                                        setData={(d: any) => {
                                            setSelectedUserChat(d);
                                            setMessages(item?.messages)
                                        }}
                                        data={{
                                            select: selectId == item?._id,
                                            id: item?._id,
                                            ...item,
                                        }} />
                                })
                                }
                            </>
                        }
                    </div>
                </div>
                <div className="w-full h-full flex justify-center items-center">
                    <div className="w-[90%] h-[90%] bg-[#F5FAFD] rounded-3xl relative">
                        <div className="w-full bg-white h-[80px] rounded-t-3xl flex flex-row items-center px-5">
                            <img
                                src={getImage(selectedUserChat?.avatar)}
                                className={`min-w-[56px] w-[56px] h-[56px] rounded-full`}
                            />
                            <div className="ml-5 gap-2">
                                <h1 className={`text-xl text-black font-[Montserrat]`}>
                                    {selectedUserChat?.surname} {selectedUserChat?.name}
                                </h1>
                                <h2 className={`text-black ml-auto font-[Montserrat]`}>{onlineUser ? "в сети" : "не в сети"}</h2>
                            </div>
                            {selectedUserChat?.avatar == "gpt.jpg" ? <></> :
                                <div
                                    onClick={() => setCallOpen(true)}
                                    className="ml-auto mr-5 cursor-pointer">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M20.6633 18.771C20.6633 18.771 19.5047 19.909 19.2207 20.2426C18.7582 20.7362 18.2132 20.9693 17.4988 20.9693C17.4301 20.9693 17.3568 20.9693 17.2881 20.9647C15.9279 20.8779 14.6639 20.3477 13.7159 19.8953C11.1238 18.643 8.84771 16.8651 6.95629 14.6119C5.39461 12.7335 4.35044 10.9968 3.65891 9.13211C3.233 7.99409 3.07729 7.10744 3.14598 6.27107C3.19178 5.73634 3.39787 5.29302 3.77798 4.91368L5.33966 3.35519C5.56406 3.14496 5.80221 3.0307 6.03577 3.0307C6.32429 3.0307 6.55786 3.20437 6.70441 3.35062C6.70899 3.35519 6.71357 3.35977 6.71815 3.36434C6.99751 3.62485 7.26313 3.8945 7.54249 4.18243C7.68446 4.32868 7.83101 4.47493 7.97756 4.62575L9.22782 5.87345C9.71327 6.35791 9.71327 6.8058 9.22782 7.29026C9.09501 7.4228 8.96678 7.55534 8.83397 7.68331C8.44927 8.07636 8.75147 7.77477 8.35304 8.13126C8.34388 8.1404 8.33472 8.14497 8.33014 8.15411C7.93629 8.54716 8.00956 8.93107 8.092 9.19158C8.09658 9.20529 8.10116 9.219 8.10573 9.23271C8.43089 10.0188 8.88886 10.7592 9.58498 11.6413L9.58956 11.6459C10.8536 13.1998 12.1862 14.4109 13.6563 15.3387C13.8441 15.4575 14.0364 15.5535 14.2196 15.6449C14.3845 15.7272 14.5402 15.8049 14.673 15.8871C14.6913 15.8963 14.7097 15.91 14.728 15.9191C14.8837 15.9968 15.0302 16.0334 15.1814 16.0334C15.5615 16.0334 15.7996 15.7957 15.8775 15.718L16.7752 14.8222C16.9309 14.6668 17.1782 14.4794 17.4667 14.4794C17.7506 14.4794 17.9842 14.6576 18.1262 14.813C18.1308 14.8176 18.1308 14.8176 18.1353 14.8222L20.6587 17.3404C21.1305 17.8066 20.6633 18.771 20.6633 18.771Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </div>
                            }
                        </div>
                        <div ref={ref} className="w-full h-full overflow-scroll overflow-x-hidden px-5 flex gap-4 flex-col pb-5" style={{
                            height: "calc(100% - 200px)"
                        }}>
                            <div className="h-5" />
                            {
                                selectedUserChat?.avatar == "gpt.jpg" ?
                                    <h1 className="text-black mx-auto font-[Montserrat]">
                                        Внимание! Диагнозы от нейросети могут быть не точными, пожалуйста погуглите прежде чем действовать по советам.
                                    </h1>
                                    : <></>
                            }
                            {/* <div className="max-w-[70%] w-fit bg-white shadow-md rounded-2xl p-7">
                                Добрый день Егор, как себя чувствуете?
                            </div>
                            <div className="max-w-[70%] w-fit bg-white shadow-md rounded-2xl p-7 ml-auto">
                                Отлично ПРЕКРАСНо спасибо !
                            </div> */}
                            {
                                messages && messages.length > 0 && messages.map((item: any) => {
                                    //console.log(item)
                                    const this_my = item?.user_id == userData?._id;
                                    //console.log(item?.topic)
                                    //console.log('itema:', item)
                                    if (item?.call != undefined) {
                                        return <h1 className="text-black mx-auto font-[Montserrat]">{item?.call ? "Начата видеовстреча" : "Видеовстреча закончена"} {item?.call_date}</h1>
                                    }
                                    return <div className={`max-w-[70%] w-fit bg-white shadow-md rounded-2xl p-7 ${this_my ? "ml-auto" : ""}`}>
                                        {item?.text}

                                        {(item?.topic || item?.google) && <br />}
                                        {item?.topic && item?.topic?.length > 0 ? item?.topic?.map((item: any) => typeof item == 'string' ? <>
                                            <a target={"_blank"} className="text-[#0067E2] font-[Montserrat] flex flex-row justify-between items-center mt-2 shadow-sm p-2 bg-white rounded-md" href={`https://yandex.ru/search/?text=${item}`}>
                                                {item} Yandex
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M10.875 3H6.375C4.51104 3 3 4.51103 3 6.37498V17.625C3 19.489 4.51104 21 6.375 21H17.625C19.489 21 21 19.489 21 17.625V13.1249M15.3744 3.00027L21 3M21 3V8.06261M21 3L11.4367 12.5622" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                                </svg>
                                            </a></> : <></>) : <></>}
                                        {item?.google ? <>
                                            <a target={"_blank"} className="text-[#0067E2] font-[Montserrat] flex flex-row justify-between items-center mt-2 shadow-sm p-2 bg-white rounded-md" href={`https://yandex.ru/search/?text=${item?.google}`}>
                                                {item?.google} Yandex
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M10.875 3H6.375C4.51104 3 3 4.51103 3 6.37498V17.625C3 19.489 4.51104 21 6.375 21H17.625C19.489 21 21 19.489 21 17.625V13.1249M15.3744 3.00027L21 3M21 3V8.06261M21 3L11.4367 12.5622" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                                </svg>
                                            </a></> : <></>}
                                    </div>
                                })
                            }
                            {
                                (loading && selectedUserChat?.avatar == 'gpt.jpg') ?
                                    <>
                                        <div className="max-w-[70%] w-fit bg-white shadow-md rounded-2xl p-7 ml-auto">
                                            <div className='w-full px-[5%] flex justify-center items-center h-[24px]'>
                                                <div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
                                            </div>
                                        </div>
                                        <div className="max-w-[70%] w-fit bg-white shadow-md rounded-2xl p-7">
                                            <div className='w-full px-[5%] flex justify-center items-center h-[24px]'>
                                                <div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
                                            </div>
                                        </div>
                                    </>
                                    : <></>
                            }

                        </div>
                        <div className="w-[94%] mx-[3%] px-6 bg-white h-[75px] shadow-md rounded-3xl flex flex-row items-center absolute bottom-0 mb-5">
                            <input
                                type="text"
                                className="border-none h-full focus:outline-none w-full bg-transparent placeholder-text-[#C9CBD2] font-[Montserrat]"
                                placeholder='Введите сообщение...'
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                            />
                            {selectId &&
                                <div
                                    onClick={() => sendMessage()}
                                    className="bg-[#0067E2] cursor-pointer rounded-xl w-[200px] h-[40px] text-white font-[Montserrat] font-semibold flex justify-center items-center">
                                    Отправить
                                    <svg className="ml-2" width="26" height="24" viewBox="0 0 26 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M24.3124 12L11.673 12M6.34676 16.1693H3.91245M6.34676 12.1464H1.51245M6.34676 8.12356H3.91245M10.6198 4.59596L23.8752 11.0228C24.6915 11.4186 24.6915 12.5814 23.8752 12.9772L10.6198 19.4041C9.71176 19.8443 8.74657 18.9161 9.15107 17.9915L11.5819 12.4353C11.7033 12.1578 11.7033 11.8422 11.5819 11.5647L9.15107 6.00848C8.74657 5.08391 9.71176 4.15568 10.6198 4.59596Z" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </div>
                            }
                            {selectedUserChat?.avatar == "gpt.jpg" &&
                                <div
                                    onClick={() => clearChat()}
                                    className="bg-[#0067E2] ml-2 cursor-pointer rounded-xl w-[200px] h-[40px] text-white font-[Montserrat] font-semibold flex justify-center items-center">
                                    Очистить
                                    <svg className="ml-2" width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M19.9283 21.3413H7.49862L2.97873 16.8214C2.76828 16.6097 2.65015 16.3233 2.65015 16.0248C2.65015 15.7263 2.76828 15.4399 2.97873 15.2282L14.2784 3.92844C14.4902 3.71798 14.7766 3.59985 15.0751 3.59985C15.3736 3.59985 15.66 3.71798 15.8717 3.92844L21.5216 9.5783C21.732 9.79001 21.8501 10.0764 21.8501 10.3749C21.8501 10.6735 21.732 10.9598 21.5216 11.1716L17.6501 15.043M11.3518 21.3413L17.6501 15.043M10.1619 8.04496L17.6501 15.043" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Chat;