import {
    rateLimit
} from "express-rate-limit";

const createRateLimiter = ({
    windowMs,
    limit,
    message,
    code
}) => {
    return rateLimit({
        windowMs,

        limit,

        standardHeaders:
            "draft-8",

        legacyHeaders:
            false,

        handler: (
            req,
            res
        ) => {
            return res
                .status(429)
                .json({
                    success:
                        false,

                    code,

                    message
                });
        }
    });
};


/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
|
| Maximum 10 login attempts
| per 15 minutes per IP.
|
*/

export const loginRateLimiter =
    createRateLimiter({
        windowMs:
            15 *
            60 *
            1000,

        limit:
            10,

        code:
            "LOGIN_RATE_LIMIT_EXCEEDED",

        message:
            "Too many login attempts. Please try again later."
    });


/*
|--------------------------------------------------------------------------
| Forgot Password
|--------------------------------------------------------------------------
*/

export const forgotPasswordRateLimiter =
    createRateLimiter({
        windowMs:
            15 *
            60 *
            1000,

        limit:
            5,

        code:
            "PASSWORD_RESET_RATE_LIMIT_EXCEEDED",

        message:
            "Too many password reset requests. Please try again later."
    });


/*
|--------------------------------------------------------------------------
| Resend OTP
|--------------------------------------------------------------------------
|
| You already have the 60-second
| per-account resend cooldown.
|
| This is an additional IP-level
| protection.
|
*/

export const resendOtpRateLimiter =
    createRateLimiter({
        windowMs:
            15 *
            60 *
            1000,

        limit:
            5,

        code:
            "OTP_RESEND_RATE_LIMIT_EXCEEDED",

        message:
            "Too many OTP resend requests. Please try again later."
    });


/*
|--------------------------------------------------------------------------
| Verify OTP
|--------------------------------------------------------------------------
|
| Your database already limits
| attempts per OTP request.
|
| This adds another IP-level layer.
|
*/

export const verifyOtpRateLimiter =
    createRateLimiter({
        windowMs:
            10 *
            60 *
            1000,

        limit:
            10,

        code:
            "OTP_VERIFICATION_RATE_LIMIT_EXCEEDED",

        message:
            "Too many OTP verification attempts. Please try again later."
    });


/*
|--------------------------------------------------------------------------
| Reset Password
|--------------------------------------------------------------------------
*/

export const resetPasswordRateLimiter =
    createRateLimiter({
        windowMs:
            15 *
            60 *
            1000,

        limit:
            5,

        code:
            "PASSWORD_RESET_SUBMISSION_RATE_LIMIT_EXCEEDED",

        message:
            "Too many password reset attempts. Please try again later."
    });

/*
|--------------------------------------------------------------------------
| Verify Email Rate Limiter
|--------------------------------------------------------------------------
*/

export const verifyEmailRateLimiter =
    createRateLimiter({
        windowMs:
            10 *
            60 *
            1000,

        limit:
            10,

        code:
            "EMAIL_VERIFICATION_RATE_LIMIT_EXCEEDED",

        message:
            "Too many email verification attempts. Please try again later."
    });


export const resendVerificationRateLimiter =
    createRateLimiter({
        windowMs:
            15 *
            60 *
            1000,

        limit:
            5,

        code:
            "EMAIL_VERIFICATION_RESEND_RATE_LIMIT_EXCEEDED",

        message:
            "Too many verification code requests. Please try again later."
    });