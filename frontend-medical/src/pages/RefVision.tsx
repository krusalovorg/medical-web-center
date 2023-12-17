import { useContext, useEffect, useState } from "react";
import SearchInput from "../components/SearchInput";
import UserMessage from "../components/UserMessage";
import Plus from "../icons/Plus";
import { URL_SERVER, UserData, getCookieToken, getDoctors, getImage, getReferences, getUserData } from "../utils/backend";
import Input from "../components/Input";
import UserContext from "../contexts/UserContext";
import Modal from "../components/Modal";
import MinimalInput from "../components/MinimalInput";
import PenIcon from "../icons/PenIcon";
import CategoryItem from "../components/CategoryItem";
import DateInput from "../components/DateInput";
import moment from "moment";

function RefVision() {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);

    const [isHovered, setIsHovered] = useState(false);
    const [open, setOpen] = useState(false);

    const [file, setFile] = useState<any>();
    const [newFileAsImage, setNewFileAsImage] = useState<any>();

    const userData = useContext(UserContext);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files: any = e.target.files;
        setFile(files[0]);

        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target) {
                const result = event.target.result as ArrayBuffer;
                // преобразование массива байт в изображение
                const blob = new Blob([result], { type: "image/" });
                const urlCreator = window.URL || window.webkitURL;
                const imageUrl = urlCreator.createObjectURL(blob);
                setNewFileAsImage(imageUrl);
            }
        };
        if (files[0]) {
            reader.readAsArrayBuffer(files[0]);
        }
    };

    async function imageToText() {
        setLoading(true)

        const new_userData = new FormData();
        new_userData.append('image', file, file.name);

        const res = await fetch(URL_SERVER + '/image_to_text', {
            method: 'POST',
            headers: {
                Authorization: "Bearer " + getCookieToken(),
            },
            body: new_userData
        })
        const data = await res.json();
        console.log('User updated successfully:', data);
        setOpen(false)
        setText(data?.text)
        setLoading(false);
    }

    return (
        <>
            <div className="w-full h-full flex justify-center align-center">
                <div className="w-full h-full flex justify-center items-center">
                    <div className="w-[90%] h-[90%] bg-[#F5FAFD] rounded-3xl relative">
                        <div className="w-full bg-white h-[80px] rounded-t-3xl flex flex-row items-center px-5 mb-5">
                            <div className="ml-5 gap-2">
                                <h1 className={`text-xl text-black font-[Montserrat]`}>
                                    Расшифровка справок и документов
                                </h1>
                            </div>
                        </div>
                        <div className="px-[3%] pt-2 flex flex-row w-full">
                            <div className="w-[45%]">
                                <div
                                    className="bg-white w-full h-[500px] overflow-hidden shadow-md w-fit p-5 rounded-xl mb-5 flex flex-col justify-center items-center cursor-pointer relative"
                                    onMouseEnter={() => setIsHovered(true)}
                                    onMouseLeave={() => setIsHovered(false)}
                                >
                                    {isHovered && (
                                        <div
                                            className="absolute top-0 bg-gray-800 bg-opacity-25 rounded-xl w-full h-full flex items-center justify-center">
                                            <div className="text-white text-lg">Добавить документ</div>
                                            <input
                                                className="absolute w-full h-full opacity-0"
                                                type="file"
                                                accept=".jpg,.png"
                                                onChange={handleImageChange} />
                                        </div>
                                    )}
                                    <img
                                        src={
                                            (file && newFileAsImage) ? newFileAsImage :
                                                "/image.svg"
                                        }
                                        className={(file && newFileAsImage) ? `w-full h-[160px] rounded-md` : "w-[32px] h-[32px]"}
                                        style={{
                                            aspectRatio: 1,
                                            height: 'auto'
                                        }}
                                    />
                                    <h2 className="text-sm text-black font-[Montserrat] mt-2 truncate max-w-[200px] z-[100]">
                                        {file ? file?.name : "Нажмите чтобы добавить"}
                                    </h2>
                                </div>
                                <div
                                    onClick={() => imageToText()}
                                    className="bg-[#0067E2] w-full cursor-pointer rounded-xl h-[60px] text-white font-[Montserrat] font-semibold flex justify-center items-center">
                                    Расшифровка
                                    <svg className="ml-2" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M19.0968 11.0866L12.0911 21.32C11.7382 21.8286 10.9079 21.6002 10.9079 20.9879L10.8976 15.1343C10.8976 14.4596 10.3268 13.92 9.621 13.9096L5.43836 13.8577C4.9298 13.8473 4.62882 13.318 4.90905 12.9132L11.9147 2.6798C12.2676 2.17124 13.0979 2.39958 13.0979 3.01192L13.1083 8.86554C13.1083 9.54016 13.6791 10.0798 14.3848 10.0902L18.5675 10.1421C19.0656 10.1421 19.3666 10.6818 19.0968 11.0866Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </div>
                            </div>
                            <div className="w-[45%] ml-[5%] overflow-hidden">
                                <h1 className="text-black mx-auto font-[Montserrat] text-2xl h-auto break-words mb-2">
                                    Результат:
                                </h1>
                                <h1 className="text-black mx-auto font-[Montserrat] h-auto break-words">
                                    {loading ? <div className='w-full px-[5%] flex justify-center items-center h-[24px]'>
                                        <div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
                                    </div> : <></>}
                                    {text}
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default RefVision;