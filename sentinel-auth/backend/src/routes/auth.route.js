import express from "express";

import authController from "../controllers/auth.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";

import asyncHandler from "../utils/async-handler.js";

import {
    loginRateLimiter,
    forgotPasswordRateLimiter,
    resendOtpRateLimiter,
    verifyOtpRateLimiter,
    resetPasswordRateLimiter,
    verifyEmailRateLimiter,
    resendVerificationRateLimiter
} from "../middlewares/rate-limit.middleware.js";

const router =
    express.Router();

router.post(
    "/register",
    asyncHandler(
        authController.register.bind(
            authController
        )
    )
);

router.post(
    "/login",
    loginRateLimiter,
    asyncHandler(
        authController.login.bind(
            authController
        )
    )
);

router.post(
    "/refresh",
    asyncHandler(
        authController.refresh.bind(
            authController
        )
    )
);

router.get(
    "/me",
    asyncHandler(
        authMiddleware
    ),
    asyncHandler(
        authController.me.bind(
            authController
        )
    )
);

router.post(
    "/logout",
    asyncHandler(
        authMiddleware
    ),
    asyncHandler(
        authController.logout.bind(
            authController
        )
    )
);

router.put(
    "/change-password",
    asyncHandler(
        authMiddleware
    ),
    asyncHandler(
        authController.changePassword.bind(
            authController
        )
    )
);

router.post(
    "/forgot-password",
    forgotPasswordRateLimiter,
    asyncHandler(
        authController.forgotPassword.bind(
            authController
        )
    )
);

router.post(
    "/verify-reset-otp",
    verifyOtpRateLimiter,
    asyncHandler(
        authController.verifyResetOtp.bind(
            authController
        )
    )
);

router.post(
    "/reset-password",
    resetPasswordRateLimiter,
    asyncHandler(
        authController.resetPassword.bind(
            authController
        )
    )
);

router.post(
    "/resend-reset-otp",
    resendOtpRateLimiter,
    asyncHandler(
        authController.resendResetOtp.bind(
            authController
        )
    )
);

router.post(
    "/verify-email",
    verifyEmailRateLimiter,
    asyncHandler(
        authController.verifyEmail.bind(
            authController
        )
    )
);

router.post(
    "/resend-verification-otp",
    resendVerificationRateLimiter,
    asyncHandler(
        authController.resendEmailVerificationOtp.bind(
            authController
        )
    )
);

export default router;