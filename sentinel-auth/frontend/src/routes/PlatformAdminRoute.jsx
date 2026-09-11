import {
    useContext
} from "react";

import {
    Navigate,
    useLocation
} from "react-router-dom";

import AppLoader
    from "../components/common/AppLoader.jsx";

import {
    AuthContext
} from "../context/auth-context.js";

const PlatformAdminRoute = ({
    children
}) => {
    const location =
        useLocation();

    const {
        user,
        initializing,
        isAuthenticated
    } =
        useContext(
            AuthContext
        );

    if (initializing) {
        return (
            <AppLoader />
        );
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
                state={{
                    from: location
                }}
            />
        );
    }

    if (
        user?.is_platform_admin !==
        true
    ) {
        return (
            <Navigate
                to="/dashboard"
                replace
            />
        );
    }

    return children;
};

export default PlatformAdminRoute;