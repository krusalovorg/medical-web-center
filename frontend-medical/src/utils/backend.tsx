export const URL_SERVER = "http://127.0.0.1:5000";

export async function getData() {
    let url = URL_SERVER;
    try {
        console.log("fetch url:", url);
        const response = await fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        // return data as any;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}

async function requestData(url: string) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return response.json();
}

export async function getItemById(
    id: string,
    category: "places" | "routes" | "category"
) {
    try {
        const url = `${URL_SERVER}/get_details_id?id=${id}&table_name=${category}`;
        console.log("fetch url:", url);
        const data = await requestData(url);
        //console.log('data:', data)
        return data;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}

export const getCookieToken = () => {
    let res = document.cookie.split("; ").find((row) => row.startsWith("access_token="))
    if (res) {
        res = res.replace("access_token=", "");
    }
    return res;
};
export const getImage = (image: string) => URL_SERVER + `/image/${image}`;

export type UserData = {
    name: string;
    surname: string;
    patronymic: string;
    password: string;
    phone_number?: string;
    email: string;
    birthday?: string;
    position?: string;
    isDoctor?: boolean;
    _id?: any;
};

export const getDoctors = async (searchText: string) => {
    try {
        console.log('cookie:::', getCookieToken())
        const response = await fetch(URL_SERVER + "/show_doctor", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + getCookieToken(),
            },
            body: JSON.stringify({ search_item: searchText }),
        });
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        return data as UserData[];
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
};
