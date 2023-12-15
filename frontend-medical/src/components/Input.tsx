function Input({
    placeholder,
    setValue,
    value,
    title,
    type
}: {
    placeholder: string,
    setValue: any,
    value: string,
    title: string,
    type?: string
}) {
    return (
        <>
            <h2 className="text-md text-black font-[Montserrat] mb-2 pl-5">{title}</h2>
            <div className="w-full px-6 bg-white h-[70px] shadow-md rounded-xl flex flex-row items-center mb-5">
                <input
                    type={type || "text"}
                    className="border-none h-full focus:outline-none w-full bg-transparent placeholder-text-[#C9CBD2] font-[Montserrat]"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e)=>setValue(e.target.value)}
                />
            </div>
        </>
    )
}

export default Input;