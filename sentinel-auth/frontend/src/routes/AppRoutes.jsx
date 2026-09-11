import {
    Navigate,
    Route,
    Routes
} from "react-router-dom";

import Login
    from "../pages/Login.jsx";

import Register
    from "../pages/Register.jsx";

import VerifyEmail
    from "../pages/VerifyEmail.jsx";

import ForgotPassword
    from "../pages/ForgotPassword.jsx";

import VerifyResetOtp
    from "../pages/VerifyResetOtp.jsx";

import ResetPassword
    from "../pages/ResetPassword.jsx";

import Dashboard
    from "../pages/Dashboard.jsx";

import OrganizationRequest
    from "../pages/OrganizationRequest.jsx";

import AcceptInvitation
    from "../pages/AcceptInvitation.jsx";

import AdminOrganizationRequests
    from "../pages/AdminOrganizationRequests.jsx";

import ProtectedRoute
    from "./ProtectedRoute.jsx";

import PublicOnlyRoute
    from "./PublicOnlyRoute.jsx";

import PlatformAdminRoute
    from "./PlatformAdminRoute.jsx";

const AppRoutes = () => {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <Navigate
                        to="/dashboard"
                        replace
                    />
                }
            />

            <Route
                path="/login"
                element={
                    <PublicOnlyRoute>
                        <Login />
                    </PublicOnlyRoute>
                }
            />

            <Route
                path="/register"
                element={
                    <PublicOnlyRoute>
                        <Register />
                    </PublicOnlyRoute>
                }
            />

            <Route
                path="/verify-email"
                element={
                    <PublicOnlyRoute>
                        <VerifyEmail />
                    </PublicOnlyRoute>
                }
            />

            <Route
                path="/forgot-password"
                element={
                    <PublicOnlyRoute>
                        <ForgotPassword />
                    </PublicOnlyRoute>
                }
            />

            <Route
                path="/verify-reset-otp"
                element={
                    <PublicOnlyRoute>
                        <VerifyResetOtp />
                    </PublicOnlyRoute>
                }
            />

            <Route
                path="/reset-password"
                element={
                    <PublicOnlyRoute>
                        <ResetPassword />
                    </PublicOnlyRoute>
                }
            />

            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/organizations/request"
                element={
                    <ProtectedRoute>
                        <OrganizationRequest />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/invitations/accept"
                element={
                    <ProtectedRoute>
                        <AcceptInvitation />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/organization-requests"
                element={
                    <PlatformAdminRoute>
                        <AdminOrganizationRequests />
                    </PlatformAdminRoute>
                }
            />

            <Route
                path="*"
                element={
                    <Navigate
                        to="/dashboard"
                        replace
                    />
                }
            />
        </Routes>
    );
};

export default AppRoutes;