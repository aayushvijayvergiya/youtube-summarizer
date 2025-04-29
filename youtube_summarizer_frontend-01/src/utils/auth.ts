import { getItem } from "@/service/localstorage"

export const getAuthToken = async (): Promise<string | null> => {
    const token = await getItem<string>("token");
    if (!token) {
        return null;
    }
    return token;
}