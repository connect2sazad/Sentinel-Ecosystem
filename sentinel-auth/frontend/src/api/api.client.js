import axios from "axios";

import {
    clearAccessToken,
    getAccessToken,
    setAccessToken
} from "./token.store.js";

const API_BASE_URL =
    import.meta.env
        .VITE_API_BASE_URL;

const apiClient =
    axios.create({
        baseURL:
            API_BASE_URL,

        withCredentials:
            true,

        headers: {
            "Content-Type":
                "application/json",

            Accept:
                "application/json"
        }
    });

const refreshClient =
    axios.create({
        baseURL:
            API_BASE_URL,

        withCredentials:
            true,

        headers: {
            "Content-Type":
                "application/json",

            Accept:
                "application/json"
        }
    });

let isRefreshing =
    false;

let refreshQueue =
    [];

const resolveQueue = (
    error,
    token = null
) => {
    refreshQueue.forEach(
        promise => {
            if (error) {
                promise.reject(
                    error
                );
            } else {
                promise.resolve(
                    token
                );
            }
        }
    );

    refreshQueue = [];
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

apiClient.interceptors.request.use(
    config => {
        const token =
            getAccessToken();

        if (token) {
            config.headers.Authorization =
                `Bearer ${token}`;
        }

        return config;
    },

    error =>
        Promise.reject(
            error
        )
);

apiClient.interceptors.response.use(
    response =>
        response,

    async error => {
        const originalRequest =
            error.config;

        const status =
            error.response
                ?.status;

        if (
            status !== 401 ||
            !originalRequest ||
            originalRequest._retry
        ) {
            return Promise.reject(
                error
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Do not attempt refresh when refresh/login itself fails
        |--------------------------------------------------------------------------
        */

        const requestUrl =
            String(
                originalRequest.url ||
                ""
            );

        if (
            requestUrl.includes(
                "/auth/login"
            ) ||
            requestUrl.includes(
                "/auth/refresh"
            )
        ) {
            return Promise.reject(
                error
            );
        }

        if (isRefreshing) {
            return new Promise(
                (
                    resolve,
                    reject
                ) => {
                    refreshQueue.push({
                        resolve,
                        reject
                    });
                }
            ).then(
                token => {
                    originalRequest
                        .headers
                        .Authorization =
                        `Bearer ${token}`;

                    return apiClient(
                        originalRequest
                    );
                }
            );
        }

        originalRequest._retry =
            true;

        isRefreshing =
            true;

        try {
            const response =
                await refreshClient.post(
                    "/auth/refresh"
                );

            const token =
                extractAccessToken(
                    response
                );

            if (!token) {
                throw new Error(
                    "Refresh response did not contain an access token."
                );
            }

            setAccessToken(
                token
            );

            resolveQueue(
                null,
                token
            );

            originalRequest
                .headers
                .Authorization =
                `Bearer ${token}`;

            return apiClient(
                originalRequest
            );
        } catch (
            refreshError
        ) {
            clearAccessToken();

            resolveQueue(
                refreshError,
                null
            );

            return Promise.reject(
                refreshError
            );
        } finally {
            isRefreshing =
                false;
        }
    }
);

export {
    apiClient,
    refreshClient
};