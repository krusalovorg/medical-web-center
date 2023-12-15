import { UserData } from "../utils/backend";

function UserMessage({ data, setId }: { data: UserData | any, setId?: any }) {
    const select = data?.select;
    return (
        <>
            <div
                onClick={() => {
                    if (setId) {
                        setId(data?.id || 0)
                    }
                }}
                className={`w-full p-5 rounded-3xl flex flex-row items-start mb-2 ${select ? 'bg-[#0067E3]' : ''} cursor-pointer`}>
                <img
                    src="https://sun9-4.userapi.com/impg/TKkFV1S0TTKWi9-d49YO8q_ZMVlaliEETAZctQ/wSce4SocHD0.jpg?size=512x683&quality=95&sign=31012baaf0d0f6039c37d205054a34ad&type=album"
                    className={`min-w-[56px] h-[56px] rounded-full ${select && 'border-white border-2'}`}
                />
                <div className="pl-4" style={{
                    width: "calc(100% - 60px)"
                }}>
                    <div className="w-full flex flex-row items-end">
                        <h1 className={`text-xl ${select ? "text-white" : "text-black"} font-[Montserrat]`}>
                            {data?.surname} {data?.name} {data?.patronymic}
                        </h1>
                        <h2 className={`${select ? "text-white" : "text-black"} ml-auto font-[Montserrat]`}>{data?.date}</h2>
                        {data?.new_message && !select &&
                            <div className={`text-md bg-[#0067E3] w-[28px] h-[28px] rounded-full ml-3 flex font-[Montserrat] justify-center items-center text-white`}>
                                {data?.new_message}
                            </div>}
                    </div>
                    {data?.text ?
                        <h2 className={`text-lg ${select ? "text-white" : "text-black"} font-[Montserrat] four_text mt-2 h-[116px]`}>
                            {data?.text}
                        </h2>
                        :
                        <h1 className={`text-lg ${select ? "text-white" : "text-black"} font-[Montserrat]`}>
                            {data?.position}
                        </h1>
                    }
                </div>
            </div>
        </>
    )
}

export default UserMessage;