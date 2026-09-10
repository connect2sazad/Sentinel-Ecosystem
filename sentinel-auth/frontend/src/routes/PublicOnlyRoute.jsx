import {
    Navigate
} from "react-router-dom";

import {
    useAuth
} from "../context/AuthContext.jsx";

import AppLoader from "../components/common/AppLoader.jsx";

const PublicOnlyRoute = ({
    children
}) => {
    const {
        initializing,
        isAuthenticated
    } =
        useAuth();

    if (initializing) {
        return (
            <AppLoader />
        );
    }

    if (isAuthenticated) {
        return (
            <Navigate
                to="/dashboard"
                replace
            />
        );
    }

    return children;
};

export default PublicOnlyRoute;