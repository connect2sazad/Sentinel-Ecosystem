import {
    useState
} from "react";

import {
    Link,
    useLocation,
    useNavigate
} from "react-router-dom";

import SettingsMenu from "../components/settings/SettingsMenu.jsx";

import CelebrationBanner from "../components/celebration/CelebrationBanner.jsx";

import {
    useAuth
} from "../context/auth-context.js";

const getApiError = (
    error
) => {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Unable to sign in. Please try again."
    );
};

const Login = () => {

    const navigate =
        useNavigate();

    const location =
        useLocation();

    const {
        login,
        authenticating
    } =
        useAuth();

    const verificationMessage =
        location.state?.message ||
        "";

    const suggestedLogin =
        location.state?.login ||
        "";

    const [
        form,
        setForm
    ] =
        useState({
            login:
                suggestedLogin,

            password:
                ""
        });

    const [
        error,
        setError
    ] =
        useState("");

    const [
        showPassword,
        setShowPassword
    ] =
        useState(false);

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

        if (error) {
            setError("");
        }
    };

    const handleSubmit =
        async (
            event
        ) => {
            event.preventDefault();

            setError("");

            const loginValue =
                form.login.trim();

            if (!loginValue) {
                setError(
                    "Enter your email or username."
                );

                return;
            }

            if (!form.password) {
                setError(
                    "Enter your password."
                );

                return;
            }

            try {

                await login({
                    login:
                        loginValue,

                    password:
                        form.password
                });

                const destination =
                    location.state
                        ?.from
                        ?.pathname ||
                    "/dashboard";

                navigate(
                    destination,
                    {
                        replace:
                            true
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
            }
        };

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
                                SENTINEL IDENTITY
                            </div>

                            <h1
                                className="sentinel-hero-title"
                            >
                                One identity.
                                <br />

                                Every Sentinel app.
                            </h1>

                            <p
                                className="sentinel-hero-description"
                            >
                                A unified identity layer built
                                for the entire Sentinel ecosystem.
                            </p>

                            <div
                                className="sentinel-feature-row"
                            >
                                <span>
                                    Secure
                                </span>

                                <span>
                                    Private
                                </span>

                                <span>
                                    Connected
                                </span>
                            </div>
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
                                className="sentinel-mobile-brand"
                            >
                                <div
                                    className="sentinel-brand-mark"
                                >
                                    S
                                </div>
                            </div>

                            <div
                                className="sentinel-eyebrow"
                            >
                                WELCOME BACK
                            </div>

                            <h2
                                className="sentinel-auth-title"
                            >
                                Sign in to Sentinel
                            </h2>

                            <p
                                className="sentinel-auth-description"
                            >
                                Continue to your account and
                                connected Sentinel applications.
                            </p>

                            {
                                verificationMessage && (
                                    <div
                                        className="sentinel-alert sentinel-alert-success"
                                        role="status"
                                    >
                                        <i
                                            className="bi bi-check-circle"
                                        />

                                        <span>
                                            {
                                                verificationMessage
                                            }
                                        </span>
                                    </div>
                                )
                            }

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
                                        htmlFor="login"
                                        className="form-label sentinel-label"
                                    >
                                        Email or username
                                    </label>

                                    <input
                                        id="login"
                                        name="login"
                                        type="text"
                                        className="form-control sentinel-input"
                                        placeholder="you@example.com"
                                        value={
                                            form.login
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        autoComplete="username"
                                        disabled={
                                            authenticating
                                        }
                                        autoFocus
                                    />
                                </div>

                                <div
                                    className="mb-2"
                                >
                                    <div
                                        className="d-flex justify-content-between align-items-center"
                                    >
                                        <label
                                            htmlFor="password"
                                            className="form-label sentinel-label"
                                        >
                                            Password
                                        </label>

                                        <Link
                                            to="/forgot-password"
                                            className="sentinel-text-link"
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>

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
                                            placeholder="Enter your password"
                                            value={
                                                form.password
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            autoComplete="current-password"
                                            disabled={
                                                authenticating
                                            }
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
                                            aria-label={
                                                showPassword
                                                    ? "Hide password"
                                                    : "Show password"
                                            }
                                            tabIndex="-1"
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

                                <button
                                    type="submit"
                                    className="btn sentinel-primary-button w-100 mt-4"
                                    disabled={
                                        authenticating
                                    }
                                >
                                    {
                                        authenticating
                                            ? (
                                                <>
                                                    <span
                                                        className="spinner-border spinner-border-sm me-2"
                                                        aria-hidden="true"
                                                    />

                                                    Signing in...
                                                </>
                                            )
                                            : (
                                                <>
                                                    Continue

                                                    <i
                                                        className="bi bi-arrow-right ms-2"
                                                    />
                                                </>
                                            )
                                    }
                                </button>
                            </form>

                            <div
                                className="sentinel-divider"
                            >
                                <span>
                                    New to Sentinel?
                                </span>
                            </div>

                            <Link
                                to="/register"
                                className="btn sentinel-secondary-button w-100 d-flex align-items-center justify-content-center"
                            >
                                Create account
                            </Link>

                            <div
                                className="sentinel-auth-footer"
                            >
                                <span>
                                    Sentinel Identity
                                </span>

                                <span>
                                    ·
                                </span>

                                <span>
                                    Privacy
                                </span>

                                <span>
                                    ·
                                </span>

                                <span>
                                    Security
                                </span>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Login;