import {
    apiClient,
    refreshClient,
    refreshSession
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

const register = async ({
    name,
    email,
    username,
    password,
    confirmPassword
}) => {
    const response =
        await refreshClient.post(
            "/auth/register",
            {
                name,

                email,

                username,

                password,

                confirm_password:
                    confirmPassword
            }
        );

    return extractData(
        response
    );
};

const verifyEmail = async ({
    email,
    otp
}) => {
    const response =
        await refreshClient.post(
            "/auth/verify-email",
            {
                email,
                otp
            }
        );

    return extractData(
        response
    );
};

const resendVerificationOtp =
    async ({
        email
    }) => {
        const response =
            await refreshClient.post(
                "/auth/resend-verification-otp",
                {
                    email
                }
            );

        return extractData(
            response
        );
    };

const forgotPassword =
    async ({
        email
    }) => {
        const response =
            await refreshClient.post(
                "/auth/forgot-password",
                {
                    email
                }
            );

        return extractData(
            response
        );
    };

const verifyResetOtp =
    async ({
        email,
        otp
    }) => {
        const response =
            await refreshClient.post(
                "/auth/verify-reset-otp",
                {
                    email,
                    otp
                }
            );

        return extractData(
            response
        );
    };

const resendResetOtp =
    async ({
        email
    }) => {
        const response =
            await refreshClient.post(
                "/auth/resend-reset-otp",
                {
                    email
                }
            );

        return extractData(
            response
        );
    };

const resetPassword =
    async ({
        email,
        resetToken,
        password,
        confirmPassword
    }) => {
        const response =
            await refreshClient.post(
                "/auth/reset-password",
                {
                    email,

                    reset_token:
                        resetToken,

                    password,

                    confirm_password:
                        confirmPassword
                }
            );

        return extractData(
            response
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
        await refreshSession();

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
    register,

    verifyEmail,

    resendVerificationOtp,

    forgotPassword,

    verifyResetOtp,

    resendResetOtp,

    resetPassword,

    login,

    refresh,

    me,

    logout
};

export default authApi;
