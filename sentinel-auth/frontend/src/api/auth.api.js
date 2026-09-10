import {
    apiClient,
    refreshClient
} from "./api.client.js";

import {
    clearAccessToken,
    setAccessToken
} from "./token.store.js";

const extractData = (
    response
) => {
    return (
        response?.data?.data ??
        response?.data ??
        null
    );
};

const extractAccessToken = (
    response
) => {
    return (
        response?.data?.data
            ?.access_token ||

        response?.data
            ?.access_token ||

        null
    );
};

const login = async ({
    login,
    password
}) => {
    const response =
        await refreshClient.post(
            "/auth/login",
            {
                login,
                password
            }
        );

    const accessToken =
        extractAccessToken(
            response
        );

    if (!accessToken) {
        throw new Error(
            "Login response did not contain an access token."
        );
    }

    setAccessToken(
        accessToken
    );

    return extractData(
        response
    );
};

const refresh = async () => {
    const response =
        await refreshClient.post(
            "/auth/refresh"
        );

    const accessToken =
        extractAccessToken(
            response
        );

    if (!accessToken) {
        clearAccessToken();

        throw new Error(
            "Refresh response did not contain an access token."
        );
    }

    setAccessToken(
        accessToken
    );

    return extractData(
        response
    );
};

const me = async () => {
    const response =
        await apiClient.get(
            "/auth/me"
        );

    return extractData(
        response
    );
};

const logout = async () => {
    try {
        const response =
            await apiClient.post(
                "/auth/logout"
            );

        return extractData(
            response
        );
    } finally {
        clearAccessToken();
    }
};

const authApi = {
    login,
    refresh,
    me,
    logout
};

export default authApi;