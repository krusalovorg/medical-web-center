export const URL_SERVER = "http://127.0.0.0.1:5000"

export async function getData() {
    let url = URL_SERVER;
    try {
        console.log('fetch url:', url)
        const response = await fetch(url, { method: "GET", headers: { 'Content-Type': 'application/json' } });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        // return data as any;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

async function requestData(url: string) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
}

export async function getItemById(id: string, category: "places" | "routes" | "category") {
    try {
        const url = `${URL_SERVER}/get_details_id?id=${id}&table_name=${category}`;
        console.log('fetch url:', url)
        const data = await requestData(url);
        //console.log('data:', data) 
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

export const getCookieToken = () => document.cookie.split('; ').find(row => row.startsWith('access_token='));
export const getImage = (image: string) => URL_SERVER+`/image/${image}`