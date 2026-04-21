export const assertBackendSuccess = <T = any>(res: any, fallbackMessage: string): T => {
    if (!res || +res.statusCode >= 400) {
        throw new Error(res?.message || fallbackMessage);
    }
    return res as T;
};
