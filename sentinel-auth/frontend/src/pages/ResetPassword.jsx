import {
    useEffect,
    useState
} from "react";

import {
    useLocation,
    useNavigate
} from "react-router-dom";

import SettingsMenu from "../components/settings/SettingsMenu.jsx";

import CelebrationBanner from "../components/celebration/CelebrationBanner.jsx";

import authApi from "../api/auth.api.js";

const getApiError = (
    error
) => {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Unable to reset your password."
    );
};

const ResetPassword = () => {

    const location =
        useLocation();

    const navigate =
        useNavigate();

    const email =
        location.state?.email ||
        "";

    const resetToken =
        location.state?.resetToken ||
        "";

    const [
        form,
        setForm
    ] =
        useState({
            password: "",
            confirmPassword: ""
        });

    const [
        showPassword,
        setShowPassword
    ] =
        useState(false);

    const [
        showConfirmPassword,
        setShowConfirmPassword
    ] =
        useState(false);

    const [
        loading,
        setLoading
    ] =
        useState(false);

    const [
        error,
        setError
    ] =
        useState("");

    useEffect(
        () => {
            if (
                !email ||
                !resetToken
            ) {
                navigate(
                    "/forgot-password",
                    {
                        replace:
                            true
                    }
                );
            }
        },
        [
            email,
            resetToken,
            navigate
        ]
    );

    const handleChange = (
        event
    ) => {
        const {
            name,
            value
        } =
            event.target;

        setForm(
            previous => ({
                ...previous,

                [name]:
                    value
            })
        );

        setError(
            ""
        );
    };

    const handleSubmit =
        async (
            event
        ) => {
            event.preventDefault();

            setError(
                ""
            );

            if (
                form.password.length <
                8
            ) {
                setError(
                    "Password must be at least 8 characters."
                );

                return;
            }

            if (
                form.password !==
                form.confirmPassword
            ) {
                setError(
                    "Passwords do not match."
                );

                return;
            }

            setLoading(
                true
            );

            try {
                await authApi
                    .resetPassword({
                        email,

                        resetToken,

                        password:
                            form.password,

                        confirmPassword:
                            form.confirmPassword
                    });

                navigate(
                    "/login",
                    {
                        replace:
                            true,

                        state: {
                            message:
                                "Password reset successfully. Sign in with your new password.",

                            login:
                                email
                        }
                    }
                );
            } catch (
                requestError
            ) {
                setError(
                    getApiError(
                        requestError
                    )
                );
            } finally {
                setLoading(
                    false
                );
            }
        };

    if (
        !email ||
        !resetToken
    ) {
        return null;
    }

    return (
        <div
            className="sentinel-auth-page"
        >
            <CelebrationBanner />

            <SettingsMenu />

            <main
                className="sentinel-auth-shell"
            >
                <div
                    className="sentinel-auth-layout"
                >
                    <section
                        className="sentinel-auth-visual"
                    >
                        <div
                            className="sentinel-brand-block"
                        >
                            <div
                                className="sentinel-brand-mark"
                            >
                                S
                            </div>

                            <div
                                className="sentinel-eyebrow"
                            >
                                SECURE RESET
                            </div>

                            <h1
                                className="sentinel-hero-title"
                            >
                                New password.
                                <br />

                                Fresh start.
                            </h1>

                            <p
                                className="sentinel-hero-description"
                            >
                                Choose a new password for your
                                Sentinel identity.
                            </p>
                        </div>

                        <div
                            className="sentinel-ocean-decoration"
                            aria-hidden="true"
                        >
                            <div
                                className="sentinel-orbit sentinel-orbit-one"
                            />

                            <div
                                className="sentinel-orbit sentinel-orbit-two"
                            />

                            <div
                                className="sentinel-orbit sentinel-orbit-three"
                            />
                        </div>
                    </section>

                    <section
                        className="sentinel-auth-form-column"
                    >
                        <div
                            className="sentinel-auth-card"
                        >
                            <div
                                className="sentinel-verification-icon"
                            >
                                <i
                                    className="bi bi-lock"
                                />
                            </div>

                            <div
                                className="sentinel-eyebrow"
                            >
                                RESET PASSWORD
                            </div>

                            <h2
                                className="sentinel-auth-title"
                            >
                                Create a new password
                            </h2>

                            <p
                                className="sentinel-auth-description"
                            >
                                Use at least 8 characters.
                            </p>

                            {
                                error && (
                                    <div
                                        className="sentinel-alert sentinel-alert-danger"
                                        role="alert"
                                    >
                                        <i
                                            className="bi bi-exclamation-circle"
                                        />

                                        <span>
                                            {error}
                                        </span>
                                    </div>
                                )
                            }

                            <form
                                onSubmit={
                                    handleSubmit
                                }
                            >
                                <div
                                    className="mb-3"
                                >
                                    <label
                                        htmlFor="password"
                                        className="form-label sentinel-label"
                                    >
                                        New password
                                    </label>

                                    <div
                                        className="sentinel-password-field"
                                    >
                                        <input
                                            id="password"
                                            name="password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            className="form-control sentinel-input"
                                            placeholder="Enter new password"
                                            value={
                                                form.password
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            autoComplete="new-password"
                                            disabled={
                                                loading
                                            }
                                            autoFocus
                                        />

                                        <button
                                            type="button"
                                            className="sentinel-password-toggle"
                                            onClick={() =>
                                                setShowPassword(
                                                    previous =>
                                                        !previous
                                                )
                                            }
                                            tabIndex="-1"
                                            aria-label="Show or hide password"
                                        >
                                            <i
                                                className={
                                                    showPassword
                                                        ? "bi bi-eye-slash"
                                                        : "bi bi-eye"
                                                }
                                            />
                                        </button>
                                    </div>
                                </div>

                                <div
                                    className="mb-3"
                                >
                                    <label
                                        htmlFor="confirmPassword"
                                        className="form-label sentinel-label"
                                    >
                                        Confirm new password
                                    </label>

                                    <div
                                        className="sentinel-password-field"
                                    >
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={
                                                showConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            className="form-control sentinel-input"
                                            placeholder="Repeat new password"
                                            value={
                                                form.confirmPassword
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            autoComplete="new-password"
                                            disabled={
                                                loading
                                            }
                                        />

                                        <button
                                            type="button"
                                            className="sentinel-password-toggle"
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    previous =>
                                                        !previous
                                                )
                                            }
                                            tabIndex="-1"
                                            aria-label="Show or hide confirm password"
                                        >
                                            <i
                                                className={
                                                    showConfirmPassword
                                                        ? "bi bi-eye-slash"
                                                        : "bi bi-eye"
                                                }
                                            />
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn sentinel-primary-button w-100 mt-2"
                                    disabled={
                                        loading
                                    }
                                >
                                    {
                                        loading
                                            ? (
                                                <>
                                                    <span
                                                        className="spinner-border spinner-border-sm me-2"
                                                    />

                                                    Updating password...
                                                </>
                                            )
                                            : (
                                                <>
                                                    Reset password

                                                    <i
                                                        className="bi bi-check2 ms-2"
                                                    />
                                                </>
                                            )
                                    }
                                </button>
                            </form>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default ResetPassword;