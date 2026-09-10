import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState
} from "react";

import authApi from "../api/auth.api.js";

import {
    clearAccessToken
} from "../api/token.store.js";

const AuthContext =
    createContext(null);

const findUser = (
    response
) => {
    if (!response) {
        return null;
    }

    /*
    |--------------------------------------------------------------------------
    | Supports the response structures commonly used by the backend
    |--------------------------------------------------------------------------
    */

    return (
        response.user ||
        response.data?.user ||
        response
    );
};

export const AuthProvider = ({
    children
}) => {
    const [
        user,
        setUser
    ] =
        useState(null);

    const [
        initializing,
        setInitializing
    ] =
        useState(true);

    const [
        authenticating,
        setAuthenticating
    ] =
        useState(false);

    /*
    |--------------------------------------------------------------------------
    | Restore Session
    |--------------------------------------------------------------------------
    |
    | Access tokens live only in memory.
    |
    | Therefore after a browser refresh we use the HttpOnly refresh
    | cookie to obtain a fresh access token and then request /me.
    |
    */

    const restoreSession =
        useCallback(
            async () => {
                try {
                    await authApi.refresh();

                    const meResponse =
                        await authApi.me();

                    setUser(
                        findUser(
                            meResponse
                        )
                    );
                } catch (
                    error
                ) {
                    clearAccessToken();

                    setUser(
                        null
                    );
                } finally {
                    setInitializing(
                        false
                    );
                }
            },
            []
        );

    useEffect(
        () => {
            restoreSession();
        },
        [
            restoreSession
        ]
    );

    /*
    |--------------------------------------------------------------------------
    | Login
    |--------------------------------------------------------------------------
    */

    const login =
        useCallback(
            async (
                credentials
            ) => {
                setAuthenticating(
                    true
                );

                try {
                    await authApi.login(
                        credentials
                    );

                    const meResponse =
                        await authApi.me();

                    const currentUser =
                        findUser(
                            meResponse
                        );

                    setUser(
                        currentUser
                    );

                    return currentUser;
                } finally {
                    setAuthenticating(
                        false
                    );
                }
            },
            []
        );

    /*
    |--------------------------------------------------------------------------
    | Logout
    |--------------------------------------------------------------------------
    */

    const logout =
        useCallback(
            async () => {
                try {
                    await authApi.logout();
                } catch (
                    error
                ) {
                    /*
                    | Even if the backend request fails,
                    | remove frontend authentication state.
                    */
                } finally {
                    clearAccessToken();

                    setUser(
                        null
                    );
                }
            },
            []
        );

    const value =
        useMemo(
            () => ({
                user,

                initializing,

                authenticating,

                isAuthenticated:
                    Boolean(
                        user
                    ),

                login,

                logout,

                restoreSession
            }),
            [
                user,
                initializing,
                authenticating,
                login,
                logout,
                restoreSession
            ]
        );

    return (
        <AuthContext.Provider
            value={
                value
            }
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context =
        useContext(
            AuthContext
        );

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider."
        );
    }

    return context;
};