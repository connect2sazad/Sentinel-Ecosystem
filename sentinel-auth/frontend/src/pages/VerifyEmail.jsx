import {
    useEffect,
    useRef,
    useState
} from "react";

import {
    Link,
    useLocation,
    useNavigate
} from "react-router-dom";

import SettingsMenu from "../components/settings/SettingsMenu.jsx";

import CelebrationBanner from "../components/celebration/CelebrationBanner.jsx";

import authApi from "../api/auth.api.js";

const OTP_LENGTH =
    6;

const getApiError = (
    error
) => {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Unable to verify your email."
    );
};

const VerifyEmail = () => {
    const location =
        useLocation();

    const navigate =
        useNavigate();

    const email =
        location.state?.email ||
        "";

    const inputRefs =
        useRef([]);

    const [
        otp,
        setOtp
    ] =
        useState(
            Array(
                OTP_LENGTH
            ).fill("")
        );

    const [
        loading,
        setLoading
    ] =
        useState(false);

    const [
        resending,
        setResending
    ] =
        useState(false);

    const [
        error,
        setError
    ] =
        useState("");

    const [
        message,
        setMessage
    ] =
        useState("");

    useEffect(
        () => {
            if (!email) {
                navigate(
                    "/register",
                    {
                        replace:
                            true
                    }
                );
            }
        },
        [
            email,
            navigate
        ]
    );

    const handleChange = (
        index,
        value
    ) => {
        const digit =
            value
                .replace(
                    /\D/g,
                    ""
                )
                .slice(
                    -1
                );

        const nextOtp =
            [...otp];

        nextOtp[index] =
            digit;

        setOtp(
            nextOtp
        );

        setError("");

        setMessage("");

        if (
            digit &&
            index <
            OTP_LENGTH - 1
        ) {
            inputRefs.current[
                index + 1
            ]?.focus();
        }
    };

    const handleKeyDown = (
        index,
        event
    ) => {
        if (
            event.key ===
                "Backspace" &&
            !otp[index] &&
            index > 0
        ) {
            inputRefs.current[
                index - 1
            ]?.focus();
        }
    };

    const handlePaste = (
        event
    ) => {
        event.preventDefault();

        const pasted =
            event.clipboardData
                .getData(
                    "text"
                )
                .replace(
                    /\D/g,
                    ""
                )
                .slice(
                    0,
                    OTP_LENGTH
                );

        if (!pasted) {
            return;
        }

        const nextOtp =
            Array(
                OTP_LENGTH
            ).fill("");

        pasted
            .split("")
            .forEach(
                (
                    digit,
                    index
                ) => {
                    nextOtp[index] =
                        digit;
                }
            );

        setOtp(
            nextOtp
        );

        const focusIndex =
            Math.min(
                pasted.length,
                OTP_LENGTH - 1
            );

        inputRefs.current[
            focusIndex
        ]?.focus();
    };

    const handleSubmit =
        async (
            event
        ) => {
            event.preventDefault();

            setError("");

            setMessage("");

            const code =
                otp.join("");

            if (
                code.length !==
                OTP_LENGTH
            ) {
                setError(
                    "Enter the complete 6-digit verification code."
                );

                return;
            }

            setLoading(
                true
            );

            try {
                await authApi.verifyEmail({
                    email,
                    otp:
                        code
                });

                navigate(
                    "/login",
                    {
                        replace:
                            true,

                        state: {
                            message:
                                "Email verified successfully. You can now sign in.",

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

    const handleResend =
        async () => {
            setError("");

            setMessage("");

            setResending(
                true
            );

            try {
                await authApi
                    .resendVerificationOtp({
                        email
                    });

                setMessage(
                    "A new verification code has been sent."
                );

                setOtp(
                    Array(
                        OTP_LENGTH
                    ).fill("")
                );

                setTimeout(
                    () => {
                        inputRefs.current[
                            0
                        ]?.focus();
                    },
                    0
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
                setResending(
                    false
                );
            }
        };

    if (!email) {
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
                                VERIFY IDENTITY
                            </div>

                            <h1
                                className="sentinel-hero-title"
                            >
                                One last
                                <br />

                                security step.
                            </h1>

                            <p
                                className="sentinel-hero-description"
                            >
                                Confirm your email address to activate
                                your Sentinel identity.
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
                                    className="bi bi-envelope-check"
                                />
                            </div>

                            <div
                                className="sentinel-eyebrow"
                            >
                                EMAIL VERIFICATION
                            </div>

                            <h2
                                className="sentinel-auth-title"
                            >
                                Check your email
                            </h2>

                            <p
                                className="sentinel-auth-description"
                            >
                                We sent a 6-digit verification code to
                                {" "}

                                <strong>
                                    {email}
                                </strong>
                            </p>

                            {
                                error && (
                                    <div
                                        className="sentinel-alert sentinel-alert-danger"
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

                            {
                                message && (
                                    <div
                                        className="sentinel-alert sentinel-alert-success"
                                    >
                                        <i
                                            className="bi bi-check-circle"
                                        />

                                        <span>
                                            {message}
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
                                    className="sentinel-otp"
                                    onPaste={
                                        handlePaste
                                    }
                                >
                                    {
                                        otp.map(
                                            (
                                                value,
                                                index
                                            ) => (
                                                <input
                                                    key={
                                                        index
                                                    }
                                                    ref={
                                                        element => {
                                                            inputRefs.current[
                                                                index
                                                            ] =
                                                                element;
                                                        }
                                                    }
                                                    type="text"
                                                    inputMode="numeric"
                                                    autoComplete={
                                                        index ===
                                                        0
                                                            ? "one-time-code"
                                                            : "off"
                                                    }
                                                    maxLength="1"
                                                    className="sentinel-otp-input"
                                                    value={
                                                        value
                                                    }
                                                    onChange={
                                                        event =>
                                                            handleChange(
                                                                index,
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                    }
                                                    onKeyDown={
                                                        event =>
                                                            handleKeyDown(
                                                                index,
                                                                event
                                                            )
                                                    }
                                                    disabled={
                                                        loading
                                                    }
                                                    autoFocus={
                                                        index ===
                                                        0
                                                    }
                                                />
                                            )
                                        )
                                    }
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

                                                    Verifying...
                                                </>
                                            )
                                            : (
                                                <>
                                                    Verify email

                                                    <i
                                                        className="bi bi-check2 ms-2"
                                                    />
                                                </>
                                            )
                                    }
                                </button>
                            </form>

                            <div
                                className="sentinel-resend-section"
                            >
                                <span>
                                    Didn't receive the code?
                                </span>

                                <button
                                    type="button"
                                    className="sentinel-link-button"
                                    onClick={
                                        handleResend
                                    }
                                    disabled={
                                        resending
                                    }
                                >
                                    {
                                        resending
                                            ? "Sending..."
                                            : "Resend code"
                                    }
                                </button>
                            </div>

                            <div
                                className="sentinel-auth-footer"
                            >
                                <Link
                                    to="/register"
                                    className="sentinel-text-link"
                                >
                                    <i
                                        className="bi bi-arrow-left me-1"
                                    />

                                    Back to registration
                                </Link>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default VerifyEmail;