import {
    useState
} from "react";

import {
    Link,
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
        "Unable to continue. Please try again."
    );
};

const ForgotPassword = () => {

    const navigate =
        useNavigate();

    const [
        email,
        setEmail
    ] =
        useState("");

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

    const handleSubmit =
        async (
            event
        ) => {
            event.preventDefault();

            setError("");

            const normalizedEmail =
                email
                    .trim()
                    .toLowerCase();

            if (!normalizedEmail) {
                setError(
                    "Enter your email address."
                );

                return;
            }

            setLoading(
                true
            );

            try {
                await authApi
                    .forgotPassword({
                        email:
                            normalizedEmail
                    });

                navigate(
                    "/verify-reset-otp",
                    {
                        replace:
                            true,

                        state: {
                            email:
                                normalizedEmail
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
                                ACCOUNT RECOVERY
                            </div>

                            <h1
                                className="sentinel-hero-title"
                            >
                                Recover access.
                                <br />

                                Stay connected.
                            </h1>

                            <p
                                className="sentinel-hero-description"
                            >
                                Reset your password securely
                                using your verified email address.
                            </p>

                            <div
                                className="sentinel-feature-row"
                            >
                                <span>
                                    Secure OTP
                                </span>

                                <span>
                                    One-time reset
                                </span>

                                <span>
                                    Session protection
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
                                className="sentinel-verification-icon"
                            >
                                <i
                                    className="bi bi-key"
                                />
                            </div>

                            <div
                                className="sentinel-eyebrow"
                            >
                                FORGOT PASSWORD
                            </div>

                            <h2
                                className="sentinel-auth-title"
                            >
                                Reset your password
                            </h2>

                            <p
                                className="sentinel-auth-description"
                            >
                                Enter the email address linked
                                to your Sentinel account.
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
                                        htmlFor="email"
                                        className="form-label sentinel-label"
                                    >
                                        Email address
                                    </label>

                                    <input
                                        id="email"
                                        type="email"
                                        className="form-control sentinel-input"
                                        placeholder="you@example.com"
                                        value={
                                            email
                                        }
                                        onChange={
                                            event => {
                                                setEmail(
                                                    event
                                                        .target
                                                        .value
                                                );

                                                setError(
                                                    ""
                                                );
                                            }
                                        }
                                        autoComplete="email"
                                        disabled={
                                            loading
                                        }
                                        autoFocus
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn sentinel-primary-button w-100 mt-3"
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

                                                    Sending code...
                                                </>
                                            )
                                            : (
                                                <>
                                                    Send reset code

                                                    <i
                                                        className="bi bi-arrow-right ms-2"
                                                    />
                                                </>
                                            )
                                    }
                                </button>
                            </form>

                            <div
                                className="sentinel-auth-footer mt-4"
                            >
                                <Link
                                    to="/login"
                                    className="sentinel-text-link"
                                >
                                    <i
                                        className="bi bi-arrow-left me-1"
                                    />

                                    Back to sign in
                                </Link>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default ForgotPassword;