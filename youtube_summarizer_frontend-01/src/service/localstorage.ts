// Save data to localStorage
export function setItem(key: string, value: string): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            const serializedValue = JSON.stringify(value);
            localStorage.setItem(key, serializedValue);
            resolve();
        } catch (error) {
            console.error(`Error saving to localStorage: ${error}`);
            reject(error);
        }
    });
}

// Retrieve data from localStorage
export function getItem<T>(key: string): Promise<T | null> {
    return new Promise((resolve, reject) => {
        try {
            const serializedValue = localStorage.getItem(key);
            if (serializedValue === null) {
                resolve(null);
            } else {
                resolve(JSON.parse(serializedValue) as T);
            }
        } catch (error) {
            console.error(`Error retrieving from localStorage: ${error}`);
            reject(error);
        }
    });
}

// Remove data from localStorage
export function removeItem(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            localStorage.removeItem(key);
            resolve();
        } catch (error) {
            console.error(`Error removing from localStorage: ${error}`);
            reject(error);
        }
    });
}

// Clear all data from localStorage
export function clear(): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            localStorage.clear();
            resolve();
        } catch (error) {
            console.error(`Error clearing localStorage: ${error}`);
            reject(error);
        }
    });
}
