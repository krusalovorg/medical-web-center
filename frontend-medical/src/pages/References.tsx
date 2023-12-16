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

function References() {
    const [name, setName] = useState('');
    const [selectCategory, setSelectCategory] = useState('');
    const [date, setDate] = useState(moment().format("DD.MM.YYYY"));

    const [submited, setSubmited] = useState(false);

    const [isHovered, setIsHovered] = useState(false);
    const [open, setOpen] = useState(false);

    const [file, setFile] = useState<any>();
    const [newFileAsImage, setNewFileAsImage] = useState<any>();

    const [references, setReferences] = useState<any[]>([]);

    const [typeModal, setTypeModal] = useState('add');

    const [refSelected, setRefSelected] = useState<any>('');

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

    async function load() {
        const refs = await getReferences();
        setReferences(refs);
    }

    async function addReference() {
        // const errors = checkErrors(true);
        console.log(date.toString())
        if (selectCategory) {
            const new_userData = new FormData();
            new_userData.append('name', selectCategory);
            new_userData.append('date', date.toString());
            new_userData.append('image', file, file.name);


            fetch(URL_SERVER + '/add_references', {
                method: 'POST',
                headers: {
                    Authorization: "Bearer " + getCookieToken(),
                },
                body: new_userData
            })
                .then(response => response.json())
                .then(data => {
                    console.log('User updated successfully:', data);
                    setOpen(false)
                    load()
                    setName("");
                    setSelectCategory("");
                    setDate("");
                    setFile({});
                    setNewFileAsImage(null);
                })
                .catch(error => {
                    console.error('Error updating user:', error);
                });
        }
    }

    async function deleteReference() {
        if (refSelected) {
            console.log('ref rdelelete',refSelected?._id)
            fetch(URL_SERVER + '/delete_reference', {
                method: 'POST',
                headers: {
                    Authorization: "Bearer " + getCookieToken(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    reference_id: refSelected?._id,
                })
            })
                .then(response => response.json())
                .then(data => {
                    console.log('User updated successfully:', data);
                    setOpen(false)
                    load()
                })
                .catch(error => {
                    console.error('Error updating user:', error);
                });
        }
    }

    useEffect(() => {
        if (!open) {
            setTypeModal('add')
        }
    }, [open])

    useEffect(() => {
        load()
    }, [References])

    return (
        <>
            <Modal
                open={open}
                setOpen={setOpen}
                title={typeModal == 'add' ? "Добавить справку" : name}>
                <div className="mt-2">
                    <div className="min-h-[500px] h-fit mt-5 flex flex-col gap-3 mb-5">
                        <div
                            className="bg-white w-full  shadow-md w-fit p-5 rounded-xl mb-5 flex flex-col justify-center items-center cursor-pointer relative"
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            {isHovered && (
                                <div
                                    onClick={() => {
                                        if (typeModal == 'show') {
                                            const newWindow = window.open(getImage(refSelected?.image), '_blank');
                                            if (newWindow) {
                                                newWindow.focus();
                                            } else {
                                                window.location.href = refSelected?.image;
                                            }
                                        }
                                    }}
                                    className="absolute top-0 bg-gray-800 bg-opacity-25 rounded-xl w-full h-full flex items-center justify-center">
                                    <div className="text-white text-lg">{typeModal == 'add' ? "Добавить документ" : "Скачать документ"}</div>
                                    {typeModal == 'add' ?
                                        <input
                                            className="absolute w-full h-full opacity-0"
                                            type="file"
                                            accept=".jpg,.png"
                                            onChange={handleImageChange}
                                        />
                                        : <></>
                                    }
                                </div>
                            )}
                            <img
                                src={
                                    typeModal == 'add' ? ((file && newFileAsImage) ? newFileAsImage :
                                        "/image.svg") :
                                        getImage(refSelected?.image)
                                }
                                className={((file && newFileAsImage) || (typeModal == 'show')) ? `w-full h-[160px] rounded-md` : "w-[32px] h-[32px]"}
                                style={{
                                    aspectRatio: 1
                                }}
                            />
                            <h2 className="text-sm text-black font-[Montserrat] mt-2 truncate max-w-[200px]">
                                {typeModal == 'add' ? (file ? file?.name : "Нажмите чтобы добавить")
                                    : "Нажмите чтобы скачать"}
                            </h2>
                        </div>
                        <h1 className={`text-lg text-black font-[Montserrat]`}>
                            Выберете или добавьте тип справки
                        </h1>
                        <CategoryItem text="Справка" select={selectCategory} onSelect={setSelectCategory} id={"Справка"} />
                        <CategoryItem text="Анализ" select={selectCategory} onSelect={setSelectCategory} id={"Анализ"} />
                        <CategoryItem text="ПЦР-тест Covid-19" select={selectCategory} onSelect={setSelectCategory} id={"ПЦР-тест Covid-19"} />
                        <MinimalInput
                            select={selectCategory}
                            onSelect={setSelectCategory}
                            id={"Прочее"}
                            placeholder="Прочее"
                            value={name}
                            onChange={(t: string) => {
                                setSelectCategory(t);
                                setName(t);
                            }} />
                        <DateInput value={date} onChange={setDate} />
                        {/* <CategoryItem text="Прочее" select={selectCategory} onSelect={setSelectCategory} id={"Прочее"} /> */}
                    </div>
                    {
                        typeModal == 'show' ?
                            <button
                                onClick={deleteReference}
                                className="outline-none border-none w-full h-[68px] bg-red-500 text-white text-xl rounded-xl">
                                Удалить
                            </button>
                            : <button
                                onClick={addReference}
                                className="outline-none border-none w-full h-[68px] bg-[#0067E3] text-white text-xl rounded-xl">
                                Добавить
                            </button>
                    }
                </div>
            </Modal>
            <div className="w-full h-full flex justify-center align-center">
                <div className="w-full h-full flex justify-center items-center">
                    <div className="w-[90%] h-[90%] bg-[#F5FAFD] rounded-3xl relative">
                        <div className="w-full bg-white h-[80px] rounded-t-3xl flex flex-row items-center px-5 mb-5">
                            <div className="ml-5 gap-2">
                                <h1 className={`text-xl text-black font-[Montserrat]`}>
                                    Ваши справки
                                </h1>
                            </div>
                        </div>
                        <div className="px-[3%] pt-2 flex flex-wrap w-full gap-5">
                            {
                                references && references.length > 0 && references.map((item) =>
                                    <div
                                        onClick={() => {
                                            setOpen(true)
                                            setTypeModal('show');
                                            setName(item?.name)
                                            setSelectCategory(item?.name);
                                            setDate(item?.date)
                                            setRefSelected(item);
                                            console.log(item)
                                        }}
                                        className="w-[350px] h-[250px] cursor-pointer flex flex-col items-start justify-center bg-white shadow-md rounded-2xl">
                                        <img src={getImage(item?.image)} className="w-full h-[70%] rounded-t-2xl" />
                                        <div className="flex flex-row justify-between mb-auto mt-auto px-5 w-full">
                                            <h1 className={`text-md text-black font-[Montserrat]`}>
                                                {item?.name}
                                            </h1>
                                            <h1 className={`text-md text-black font-[Montserrat]`}>
                                                {item?.date}
                                            </h1>
                                        </div>
                                    </div>
                                )
                            }
                            <div
                                onClick={() => setOpen(true)}
                                className="w-[250px] h-[250px] cursor-pointer bg-white shadow-md rounded-2xl border-2 border-[#2966de] border-dashed flex justify-center items-center">
                                <PenIcon width={32} height={32} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default References;