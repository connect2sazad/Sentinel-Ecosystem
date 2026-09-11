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
        "Unable to verify the reset code."
    );
};

const getResetToken = (
    response
) => {
    return (
        response?.reset_token ||
        response?.data?.reset_token ||
        null
    );
};

const VerifyResetOtp = () => {

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

        setError(
            ""
        );

        setMessage(
            ""
        );

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

            setError(
                ""
            );

            setMessage(
                ""
            );

            const code =
                otp.join("");

            if (
                code.length !==
                OTP_LENGTH
            ) {
                setError(
                    "Enter the complete 6-digit reset code."
                );

                return;
            }

            setLoading(
                true
            );

            try {
                const response =
                    await authApi
                        .verifyResetOtp({
                            email,
                            otp:
                                code
                        });

                const resetToken =
                    getResetToken(
                        response
                    );

                if (!resetToken) {
                    throw new Error(
                        "Reset token was not returned by the server."
                    );
                }

                navigate(
                    "/reset-password",
                    {
                        replace:
                            true,

                        state: {
                            email,
                            resetToken
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
            setError(
                ""
            );

            setMessage(
                ""
            );

            setResending(
                true
            );

            try {
                await authApi
                    .resendResetOtp({
                        email
                    });

                setMessage(
                    "A new password reset code has been sent."
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
                                SECURITY CHECK
                            </div>

                            <h1
                                className="sentinel-hero-title"
                            >
                                Verify.
                                <br />

                                Then recover.
                            </h1>

                            <p
                                className="sentinel-hero-description"
                            >
                                Enter the one-time code to
                                continue with your password reset.
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
                                    className="bi bi-shield-lock"
                                />
                            </div>

                            <div
                                className="sentinel-eyebrow"
                            >
                                RESET VERIFICATION
                            </div>

                            <h2
                                className="sentinel-auth-title"
                            >
                                Enter reset code
                            </h2>

                            <p
                                className="sentinel-auth-description"
                            >
                                We sent a 6-digit code to
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
                                    to="/forgot-password"
                                    className="sentinel-text-link"
                                >
                                    <i
                                        className="bi bi-arrow-left me-1"
                                    />

                                    Change email
                                </Link>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default VerifyResetOtp;