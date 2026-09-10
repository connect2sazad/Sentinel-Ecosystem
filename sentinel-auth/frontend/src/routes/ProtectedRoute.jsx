import {
    Navigate,
    useLocation
} from "react-router-dom";

import {
    useAuth
} from "../context/AuthContext.jsx";

import AppLoader from "../components/common/AppLoader.jsx";

const ProtectedRoute = ({
    children
}) => {
    const location =
        useLocation();

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

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
                state={{
                    from:
                        location
                }}
            />
        );
    }

    return children;
};

export default ProtectedRoute;