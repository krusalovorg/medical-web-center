import { useContext, useEffect, useState } from "react";
import SearchInput from "../components/SearchInput";
import UserMessage from "../components/UserMessage";
import Plus from "../icons/Plus";
import { URL_SERVER, UserData, getCookieToken, getDoctors, getImage, getUserData } from "../utils/backend";
import Input from "../components/Input";
import UserContext from "../contexts/UserContext";

function Profile() {
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [patronymic, setPatronymic] = useState('');

    const [city, setCity] = useState('');

    const [position, setPosition] = useState('');
    const [expirience, setexpirience] = useState('');
    const [lernPosition, setLernPosition] = useState('');

    const [imDoctor, setImDoctor] = useState(true);

    const [email, setEmail] = useState('');

    const [errors, setErrors] = useState({
        name: '',
        surname: '',
        patronymic: '',
        city: '',
        position: '',
        expirience: '',
        lernPosition: ''
    });

    const [submited, setSubmited] = useState(false);

    const [isHovered, setIsHovered] = useState(false);

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

    const checkErrors = (submited_local?: boolean) => {
        const fields = { name, surname, patronymic, position, expirience, lernPosition };
        const doctor = ["position", "expirience", "lernPosition"]
        let error = false;
        let errors_res = errors;
        for (const field in fields) {
            const value = (fields as any)[field];
            if (value?.length === 0) {
                console.log('Field', field, 'is empty');
                if (submited || submited_local) {
                    if (doctor.includes(field)) {
                        if (userData?.isDoctor) {
                            errors_res = { ...errors_res, [field]: "Поле не заполнено" }
                            error = true;
                        }
                    } else {
                        errors_res = { ...errors_res, [field]: "Поле не заполнено" }
                        error = true;
                    }
                }
            } else {
                errors_res = { ...errors_res, [field]: "" }
            }
        }
        setErrors(errors_res)
        return error;
    };

    useEffect(() => {
        checkErrors();
    }, [name, surname, patronymic, city, position, expirience, lernPosition])

    async function updateUserData() {
        setSubmited(true);
        const errors = checkErrors(true);
        if (!errors) {
            const fields = { name, surname, patronymic, city, position, expirience, lernPosition };
            const new_userData = new FormData();
            for (const field in fields) {
                const value = (fields as any)[field];
                console.log(value, (userData as any)[field],field)
                if (value != (userData as any)[field] && value.length > 0) {
                    new_userData.append(field, value);
                }
            }

            if (file) {
                console.log("formData.images", file)
                new_userData.append('avatar', file, file.name);
            }

            fetch(URL_SERVER + '/update_user', {
                method: 'POST',
                headers: {
                    Authorization: "Bearer " + getCookieToken(),
                },
                body: new_userData
            })
                .then(response => response.json())
                .then(data => {
                    console.log('User updated successfully:', data);
                })
                .catch(error => {
                    console.error('Error updating user:', error);
                });
        }
    }

    useEffect(() => {
        if (userData) {
            setName(userData?.name);
            setSurname(userData?.surname);
            setPatronymic(userData?.patronymic);
            setPosition(userData?.position || "");
            setEmail(userData?.email);
        }
        console.log('usetrdata', userData)
    }, [userData])

    return (
        <div className="w-full h-full flex justify-center align-center">
            <div className="w-full h-full flex justify-center items-center">
                <div className="w-[90%] h-[90%] bg-[#F5FAFD] rounded-3xl relative">
                    <div className="w-full bg-white h-[80px] rounded-t-3xl flex flex-row items-center px-5 mb-5">
                        <div className="ml-5 gap-2">
                            <h1 className={`text-xl text-black font-[Montserrat]`}>
                                Ваш профиль
                            </h1>
                        </div>
                    </div>
                    <div className="px-[3%] pt-2 flex flex-row w-full">
                        <div className="w-[45%]">
                            <div
                                className="bg-white shadow-md w-fit p-5 rounded-xl mb-5 flex flex-col justify-center items-center cursor-pointer relative"
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                            >
                                {isHovered && (
                                    <div className="absolute top-0 bg-gray-800 bg-opacity-25 rounded-xl w-full h-full flex items-center justify-center">
                                        <div className="text-white text-lg">Добавить изображение</div>
                                        <input
                                            className="absolute w-full h-full opacity-0"
                                            type="file"
                                            accept=".jpg,.png"
                                            onChange={handleImageChange}
                                        />
                                    </div>
                                )}
                                <img
                                    src={
                                        (file && newFileAsImage) ? newFileAsImage :
                                            getImage(userData?.avatar)
                                    }
                                    className={`min-w-[160px] h-[160px] rounded-md`}
                                    style={{
                                        aspectRatio: 1
                                    }}
                                />
                                <h2 className="text-sm text-black font-[Montserrat] mt-2 truncate max-w-[200px]">{file ? file?.name : "Наведите чтобы изменить"}</h2>
                            </div>
                            <Input
                                type="name"
                                placeholder="Иван"
                                title="Имя"
                                value={name}
                                error={errors?.name}
                                setValue={setName}
                            />
                            <Input
                                type="surname"
                                placeholder="Иванов"
                                title="Фамилия"
                                value={surname}
                                error={errors?.surname}
                                setValue={setSurname}
                            />
                            <Input
                                type="patronymic"
                                placeholder="Иванов"
                                title="Отчество"
                                value={patronymic}
                                error={errors?.patronymic}
                                setValue={setPatronymic}
                            />

                            <Input
                                type="email"
                                placeholder="email@example.com"
                                title="Почта"
                                value={email}
                                disabled
                                setValue={setEmail}
                            />

                            {imDoctor && <Input
                                type="text"
                                placeholder="Хирург"
                                title="Должность"
                                value={position}
                                error={errors?.position}
                                setValue={setPosition}
                            />}

                            <div
                                onClick={updateUserData}
                                className="px-12 py-4 bg-[#0067E3] rounded-xl text-md cursor-pointer font-[Montserrat] text-white flex justify-center items-center w-fit">
                                Сохранить
                            </div>
                        </div>
                        <div className="w-[45%] ml-[5%]">
                            <Input
                                type="city"
                                placeholder="Тольятти"
                                title="Город"
                                value={city}
                                error={errors?.city}
                                setValue={setCity}
                            />
                            {imDoctor && <>
                                <Input
                                    type="text"
                                    placeholder="Больница номер 1 города Тольятти"
                                    title="Место работы"
                                    value={expirience}
                                    error={errors?.expirience}
                                    setValue={setexpirience}
                                />
                                <Input
                                    type="text"
                                    placeholder="Первый Московский государственный медицинский университет имени И.М. Сеченова"
                                    title="Место обучения"
                                    value={lernPosition}
                                    error={errors?.lernPosition}
                                    setValue={setLernPosition}
                                />
                            </>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile;