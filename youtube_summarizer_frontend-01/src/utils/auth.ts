import { getItem } from "@/service/localstorage"

export const getAuthToken = async (): Promise<string | null> => {
    const token = await getItem<string>("authToken");
    if (!token) {
        return null;
    }
    return token;
}