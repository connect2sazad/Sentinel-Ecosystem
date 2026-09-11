import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import authApi from "../api/auth.api.js";

import {
    clearAccessToken
} from "../api/token.store.js";

import { AuthContext } from "./auth-context.js";

const extractAccountData = (
    response
) => {
    if (!response) {
        return null;
    }

    return response;
};

const extractUser = (
    response
) => {
    if (!response) {
        return null;
    }

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
        account,
        setAccount
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

    const loadAccount =
        useCallback(
            async () => {
                const response =
                    await authApi.me();

                const accountData =
                    extractAccountData(
                        response
                    );

                const currentUser =
                    extractUser(
                        response
                    );

                setAccount(
                    accountData
                );

                setUser(
                    currentUser
                );

                return accountData;
            },
            []
        );

    const restoreSession =
        useCallback(
            async () => {
                try {
                    await authApi.refresh();

                    await loadAccount();
                } catch {
                    clearAccessToken();

                    setUser(null);

                    setAccount(null);
                } finally {
                    setInitializing(
                        false
                    );
                }
            },
            [
                loadAccount
            ]
        );

    useEffect(
        () => {
            // Session restoration updates state after asynchronous API calls.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            restoreSession();
        },
        [
            restoreSession
        ]
    );

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

                    const accountData =
                        await loadAccount();

                    return accountData;
                } finally {
                    setAuthenticating(
                        false
                    );
                }
            },
            [
                loadAccount
            ]
        );

    const logout =
        useCallback(
            async () => {
                try {
                    await authApi.logout();
                } catch {
                    // Frontend session should still be cleared.
                } finally {
                    clearAccessToken();

                    setUser(null);

                    setAccount(null);
                }
            },
            []
        );

    const refreshAccount =
        useCallback(
            async () => {
                return loadAccount();
            },
            [
                loadAccount
            ]
        );

    const value =
        useMemo(
            () => ({
                user,

                account,

                initializing,

                authenticating,

                isAuthenticated:
                    Boolean(
                        user
                    ),

                login,

                logout,

                restoreSession,

                refreshAccount
            }),
            [
                user,
                account,
                initializing,
                authenticating,
                login,
                logout,
                restoreSession,
                refreshAccount
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
