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
        "Unable to create your account."
    );
};

const Register = () => {
    const navigate =
        useNavigate();

    const [
        form,
        setForm
    ] =
        useState({
            name: "",
            email: "",
            username: "",
            password: "",
            confirmPassword: ""
        });

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

            const name =
                form.name.trim();

            const email =
                form.email
                    .trim()
                    .toLowerCase();

            const username =
                form.username
                    .trim();

            if (!name) {
                setError(
                    "Enter your name."
                );

                return;
            }

            if (!email) {
                setError(
                    "Enter your email address."
                );

                return;
            }

            if (!username) {
                setError(
                    "Choose a username."
                );

                return;
            }

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
                await authApi.register({
                    name,

                    email,

                    username,

                    password:
                        form.password,

                    confirmPassword:
                        form.confirmPassword
                });

                navigate(
                    "/verify-email",
                    {
                        replace:
                            true,

                        state: {
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
                                JOIN SENTINEL
                            </div>

                            <h1
                                className="sentinel-hero-title"
                            >
                                One account.
                                <br />

                                Every Sentinel app.
                            </h1>

                            <p
                                className="sentinel-hero-description"
                            >
                                Create your personal Sentinel
                                identity and use it across the
                                Sentinel ecosystem.
                            </p>

                            <div
                                className="sentinel-feature-row"
                            >
                                <span>
                                    One identity
                                </span>

                                <span>
                                    Secure access
                                </span>

                                <span>
                                    Your choice
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
                        className="sentinel-auth-form-column sentinel-register-form-column"
                    >
                        <div
                            className="sentinel-auth-card sentinel-register-card"
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
                                CREATE ACCOUNT
                            </div>

                            <h2
                                className="sentinel-auth-title"
                            >
                                Create your Sentinel account
                            </h2>

                            <p
                                className="sentinel-auth-description"
                            >
                                Your Sentinel account is personal.
                                You can join an organization later
                                if you need to.
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
                                    className="row g-3"
                                >
                                    <div
                                        className="col-12"
                                    >
                                        <label
                                            htmlFor="name"
                                            className="form-label sentinel-label"
                                        >
                                            Full name
                                        </label>

                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            className="form-control sentinel-input"
                                            placeholder="Your full name"
                                            value={
                                                form.name
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            disabled={
                                                loading
                                            }
                                            autoComplete="name"
                                            autoFocus
                                        />
                                    </div>

                                    <div
                                        className="col-md-6"
                                    >
                                        <label
                                            htmlFor="email"
                                            className="form-label sentinel-label"
                                        >
                                            Email
                                        </label>

                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            className="form-control sentinel-input"
                                            placeholder="you@example.com"
                                            value={
                                                form.email
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            disabled={
                                                loading
                                            }
                                            autoComplete="email"
                                        />
                                    </div>

                                    <div
                                        className="col-md-6"
                                    >
                                        <label
                                            htmlFor="username"
                                            className="form-label sentinel-label"
                                        >
                                            Username
                                        </label>

                                        <input
                                            id="username"
                                            name="username"
                                            type="text"
                                            className="form-control sentinel-input"
                                            placeholder="Choose a username"
                                            value={
                                                form.username
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            disabled={
                                                loading
                                            }
                                            autoComplete="username"
                                        />
                                    </div>

                                    <div
                                        className="col-md-6"
                                    >
                                        <label
                                            htmlFor="password"
                                            className="form-label sentinel-label"
                                        >
                                            Password
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
                                                placeholder="Minimum 8 characters"
                                                value={
                                                    form.password
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                disabled={
                                                    loading
                                                }
                                                autoComplete="new-password"
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
                                                aria-label={
                                                    showPassword
                                                        ? "Hide password"
                                                        : "Show password"
                                                }
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
                                        className="col-md-6"
                                    >
                                        <label
                                            htmlFor="confirmPassword"
                                            className="form-label sentinel-label"
                                        >
                                            Confirm password
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
                                                placeholder="Repeat password"
                                                value={
                                                    form.confirmPassword
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                disabled={
                                                    loading
                                                }
                                                autoComplete="new-password"
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
                                                aria-label={
                                                    showConfirmPassword
                                                        ? "Hide password"
                                                        : "Show password"
                                                }
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
                                </div>

                                <div
                                    className="sentinel-registration-note"
                                >
                                    <i
                                        className="bi bi-person-check"
                                    />

                                    <span>
                                        An organization is not required.
                                        Organization access can be added
                                        later through a verified organization
                                        or invitation.
                                    </span>
                                </div>

                                <button
                                    type="submit"
                                    className="btn sentinel-primary-button w-100 mt-4"
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

                                                    Creating account...
                                                </>
                                            )
                                            : (
                                                <>
                                                    Create account

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
                                <span>
                                    Already have an account?
                                </span>

                                <Link
                                    to="/login"
                                    className="sentinel-text-link"
                                >
                                    Sign in
                                </Link>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Register;