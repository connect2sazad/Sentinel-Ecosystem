import authService from "../services/auth.service.js";

class AuthController {
    async register(req, res) {
        const result =
            await authService.register(
                req.body
            );

        return res.status(201).json({
            success: true,

            message:
                "Welcome to Sentinel. Your account has been created.",

            data: result
        });
    }

    async login(req, res) {
        const result =
            await authService.login(
                req.body,
                {
                    ip: req.ip,

                    userAgent:
                        req.get("user-agent")
                }
            );

        this.setRefreshCookie(
            res,
            result.refreshToken
        );

        return res.status(200).json({
            success: true,

            message:
                "Welcome back.",

            data: {
                access_token:
                    result.accessToken,

                user:
                    result.user,

                session:
                    result.session
            }
        });
    }

    async refresh(req, res) {
        const refreshToken =
            req.cookies
                ?.sentinel_refresh_token;

        const result =
            await authService.refresh(
                refreshToken
            );

        this.setRefreshCookie(
            res,
            result.refreshToken
        );

        return res.status(200).json({
            success: true,

            message:
                "Session refreshed successfully.",

            data: {
                access_token:
                    result.accessToken
            }
        });
    }

    async me(req, res) {
        const user =
            await authService.me(
                req.auth.sub
            );

        return res.status(200).json({
            success: true,

            data: user
        });
    }

    async logout(req, res) {
        const refreshToken =
            req.cookies
                ?.sentinel_refresh_token;

        await authService.logout(
            req.auth?.session_id,
            refreshToken
        );

        res.clearCookie(
            "sentinel_refresh_token",
            {
                httpOnly: true,
                sameSite: "lax",
                secure:
                    process.env.NODE_ENV ===
                    "production"
            }
        );

        return res.status(200).json({
            success: true,

            message:
                "Signed out successfully."
        });
    }

    setRefreshCookie(
        res,
        refreshToken
    ) {
        res.cookie(
            "sentinel_refresh_token",
            refreshToken,
            {
                httpOnly: true,

                secure:
                    process.env.NODE_ENV ===
                    "production",

                sameSite:
                    "lax",

                maxAge:
                    7 *
                    24 *
                    60 *
                    60 *
                    1000
            }
        );
    }

    async changePassword(
        req,
        res
    ) {
        const result =
            await authService.changePassword({
                userId:
                    req.auth.sub,

                currentSessionId:
                    req.auth.session_id,

                currentPassword:
                    req.body.current_password,

                newPassword:
                    req.body.new_password,

                confirmPassword:
                    req.body.confirm_password
            });

        return res
            .status(200)
            .json({
                success: true,

                message:
                    result.message
            });
    }

    async forgotPassword(
        req,
        res
    ) {
        const result =
            await authService.forgotPassword({
                email:
                    req.body.email
            });

        return res
            .status(200)
            .json({
                success: true,

                message:
                    result.message
            });
    }

    async verifyResetOtp(
        req,
        res
    ) {
        const result =
            await authService.verifyResetOtp({
                email:
                    req.body.email,

                otp:
                    req.body.otp
            });

        return res
            .status(200)
            .json({
                success: true,

                message:
                    "Verification successful.",

                data: {
                    reset_token:
                        result.resetToken,

                    expires_at:
                        result.expiresAt
                }
            });
    }

    async resetPassword(
        req,
        res
    ) {
        const result =
            await authService.resetPassword({
                resetToken:
                    req.body.reset_token,

                password:
                    req.body.password,

                confirmPassword:
                    req.body.confirm_password
            });

        return res
            .status(200)
            .json({
                success: true,

                message:
                    result.message
            });
    }

    async resendResetOtp(
        req,
        res
    ) {
        const result =
            await authService.resendResetOtp({
                email:
                    req.body.email
            });

        return res
            .status(200)
            .json({
                success: true,
                message:
                    result.message
            });
    }

    async verifyEmail(
        req,
        res
    ) {
        const result =
            await authService.verifyEmail({
                email:
                    req.body.email,

                otp:
                    req.body.otp
            });

        return res
            .status(200)
            .json({
                success:
                    true,

                message:
                    result.message
            });
    }


    async resendEmailVerificationOtp(
        req,
        res
    ) {
        const result =
            await authService
                .resendEmailVerificationOtp({
                    email:
                        req.body.email
                });

        return res
            .status(200)
            .json({
                success:
                    true,

                message:
                    result.message
            });
    }
}

export default new AuthController();