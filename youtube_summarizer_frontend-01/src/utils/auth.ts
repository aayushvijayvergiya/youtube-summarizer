import { getItem, setItem } from "@/service/localstorage"

export const getAuthToken = async (): Promise<string | null> => {
    const token = await getItem<string>("authToken");
    if (!token) {
        return null;
    }
    return token;
}

export const saveAuthToken = async (token: string): Promise<void> => {
    await setItem("authToken", token);
};