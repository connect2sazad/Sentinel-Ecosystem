import bcrypt from "bcryptjs";

import {
    Op
} from "sequelize";

import sequelize from "../config/database.js";

import {
    User,
    Organization,
    OrganizationMember,
    Session,
    PasswordResetRequest,
    EmailVerificationRequest,
} from "../models/index.js";

import {
    generateOtp
} from "../utils/otp.js";

import {
    generatePasswordResetToken,
    hashPasswordResetToken
} from "../utils/password-reset-token.js";

import AppException from "../utils/app-exception.js";

import {
    createSlug
} from "../utils/slug.js";

import {
    generateAccessToken,
    generateRefreshToken,
    hashRefreshToken
} from "../utils/token.js";

import {
    addDays
} from "../utils/date.js";

import mailService from "./mail.service.js";

class AuthService {
    async register(payload) {
        const {
            name,
            email,
            username,
            password,
            confirm_password,
            organization_name
        } = payload;

        if (!name?.trim()) {
            throw new AppException(
                "Name is required.",
                422,
                "NAME_REQUIRED"
            );
        }

        if (!email?.trim()) {
            throw new AppException(
                "Email is required.",
                422,
                "EMAIL_REQUIRED"
            );
        }

        if (!organization_name?.trim()) {
            throw new AppException(
                "Organization name is required.",
                422,
                "ORGANIZATION_NAME_REQUIRED"
            );
        }

        if (!password) {
            throw new AppException(
                "Password is required.",
                422,
                "PASSWORD_REQUIRED"
            );
        }

        if (password.length < 8) {
            throw new AppException(
                "Password must contain at least 8 characters.",
                422,
                "PASSWORD_TOO_SHORT"
            );
        }

        if (
            password !==
            confirm_password
        ) {
            throw new AppException(
                "Password and confirm password do not match.",
                422,
                "PASSWORD_MISMATCH"
            );
        }

        const normalizedEmail =
            email
                .trim()
                .toLowerCase();

        const normalizedUsername =
            username?.trim()
                ? username
                    .trim()
                    .toLowerCase()
                : null;

        const existingEmail =
            await User.findOne({
                where: {
                    email:
                        normalizedEmail
                }
            });

        if (existingEmail) {
            throw new AppException(
                "An account with this email already exists.",
                409,
                "EMAIL_ALREADY_EXISTS"
            );
        }

        if (normalizedUsername) {
            const existingUsername =
                await User.findOne({
                    where: {
                        username:
                            normalizedUsername
                    }
                });

            if (existingUsername) {
                throw new AppException(
                    "This username is already taken.",
                    409,
                    "USERNAME_ALREADY_EXISTS"
                );
            }
        }

        const transaction =
            await sequelize.transaction();

        try {
            const hashedPassword =
                await bcrypt.hash(
                    password,
                    12
                );

            const user =
                await User.create(
                    {
                        name:
                            name.trim(),

                        email:
                            normalizedEmail,

                        username:
                            normalizedUsername,

                        password:
                            hashedPassword
                    },
                    {
                        transaction
                    }
                );

            const organization =
                await Organization.create(
                    {
                        name:
                            organization_name.trim(),

                        slug:
                            createSlug(
                                organization_name
                            ),

                        email:
                            normalizedEmail
                    },
                    {
                        transaction
                    }
                );

            const membership =
                await OrganizationMember.create(
                    {
                        user_id:
                            user.id,

                        organization_id:
                            organization.id,

                        role:
                            "owner",

                        joined_at:
                            new Date()
                    },
                    {
                        transaction
                    }
                );

            await transaction.commit();

            await this.createEmailVerificationOtp(
                user
            );

            return {
                message:
                    "Registration successful. Please verify your email address.",
                user: {
                    id:
                        user.id,

                    name:
                        user.name,

                    email:
                        user.email,

                    username:
                        user.username,

                    status:
                        user.status
                },

                organization: {
                    id:
                        organization.id,

                    name:
                        organization.name,

                    slug:
                        organization.slug,

                    role:
                        membership.role
                }
            };
        } catch (error) {
            await transaction.rollback();

            throw error;
        }
    }

    async login(
        payload,
        requestMeta = {}
    ) {
        const {
            login,
            password
        } = payload;

        if (!login?.trim()) {
            throw new AppException(
                "Email or username is required.",
                422,
                "LOGIN_REQUIRED"
            );
        }

        if (!password) {
            throw new AppException(
                "Password is required.",
                422,
                "PASSWORD_REQUIRED"
            );
        }

        const normalizedLogin =
            login
                .trim()
                .toLowerCase();

        const user =
            await User.findOne({
                where: {
                    [Op.or]: [
                        {
                            email:
                                normalizedLogin
                        },

                        {
                            username:
                                normalizedLogin
                        }
                    ]
                },

                include: [
                    {
                        model:
                            OrganizationMember,

                        as:
                            "memberships",

                        required: false,

                        include: [
                            {
                                model:
                                    Organization,

                                as:
                                    "organization"
                            }
                        ]
                    }
                ]
            });

        if (!user) {
            throw new AppException(
                "Invalid email, username, or password.",
                401,
                "INVALID_CREDENTIALS"
            );
        }

        if (!user.status) {
            throw new AppException(
                "This account is disabled.",
                403,
                "ACCOUNT_DISABLED"
            );
        }

        if (
            !user.email_verified_at
        ) {
            throw new AppException(
                "Please verify your email address before signing in.",
                403,
                "EMAIL_NOT_VERIFIED"
            );
        }

        const passwordMatches =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!passwordMatches) {
            throw new AppException(
                "Invalid email, username, or password.",
                401,
                "INVALID_CREDENTIALS"
            );
        }

        const refreshToken =
            generateRefreshToken();

        const refreshTokenHash =
            hashRefreshToken(
                refreshToken
            );

        const session =
            await Session.create({
                user_id:
                    user.id,

                refresh_token_hash:
                    refreshTokenHash,

                ip_address:
                    requestMeta.ip ||
                    null,

                user_agent:
                    requestMeta.userAgent ||
                    null,

                expires_at:
                    addDays(
                        new Date(),
                        7
                    ),

                last_used_at:
                    new Date()
            });

        const accessToken =
            generateAccessToken({
                sub:
                    String(user.id),

                session_id:
                    String(session.id)
            });

        await user.update({
            last_login_at:
                new Date()
        });

        return {
            accessToken,

            refreshToken,

            user:
                this.serializeUser(
                    user
                ),

            session: {
                id:
                    session.id,

                expires_at:
                    session.expires_at
            }
        };
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw new AppException(
                "Refresh token is required.",
                401,
                "REFRESH_TOKEN_REQUIRED"
            );
        }

        const refreshTokenHash =
            hashRefreshToken(
                refreshToken
            );

        const session =
            await Session.findOne({
                where: {
                    refresh_token_hash:
                        refreshTokenHash,

                    status:
                        true,

                    revoked_at:
                        null,

                    expires_at: {
                        [Op.gt]:
                            new Date()
                    }
                },

                include: [
                    {
                        model:
                            User,

                        as:
                            "user"
                    }
                ]
            });

        if (!session) {
            throw new AppException(
                "Refresh session is invalid or expired.",
                401,
                "INVALID_REFRESH_TOKEN"
            );
        }

        if (!session.user?.status) {
            throw new AppException(
                "This account is disabled.",
                403,
                "ACCOUNT_DISABLED"
            );
        }

        const newRefreshToken =
            generateRefreshToken();

        await session.update({
            refresh_token_hash:
                hashRefreshToken(
                    newRefreshToken
                ),

            last_used_at:
                new Date()
        });

        const accessToken =
            generateAccessToken({
                sub:
                    String(
                        session.user_id
                    ),

                session_id:
                    String(
                        session.id
                    )
            });

        return {
            accessToken,

            refreshToken:
                newRefreshToken
        };
    }

    async me(userId) {
        const user =
            await User.findByPk(
                userId,
                {
                    attributes: {
                        exclude: [
                            "password"
                        ]
                    },

                    include: [
                        {
                            model:
                                OrganizationMember,

                            as:
                                "memberships",

                            required:
                                false,

                            include: [
                                {
                                    model:
                                        Organization,

                                    as:
                                        "organization"
                                }
                            ]
                        }
                    ]
                }
            );

        if (!user) {
            throw new AppException(
                "User not found.",
                404,
                "USER_NOT_FOUND"
            );
        }

        return this.serializeUser(
            user
        );
    }

    async logout(
        sessionId,
        refreshToken = null
    ) {
        let session = null;

        if (sessionId) {
            session =
                await Session.findByPk(
                    sessionId
                );
        }

        if (
            !session &&
            refreshToken
        ) {
            session =
                await Session.findOne({
                    where: {
                        refresh_token_hash:
                            hashRefreshToken(
                                refreshToken
                            )
                    }
                });
        }

        if (session) {
            await session.update({
                status:
                    false,

                revoked_at:
                    new Date()
            });
        }

        return true;
    }

    serializeUser(user) {
        return {
            id:
                user.id,

            name:
                user.name,

            email:
                user.email,

            username:
                user.username,

            email_verified_at:
                user.email_verified_at,

            last_login_at:
                user.last_login_at,

            status:
                user.status,

            organizations:
                user.memberships?.map(
                    (membership) => ({
                        membership_id:
                            membership.id,

                        role:
                            membership.role,

                        organization:
                            membership.organization
                                ? {
                                    id:
                                        membership
                                            .organization
                                            .id,

                                    name:
                                        membership
                                            .organization
                                            .name,

                                    slug:
                                        membership
                                            .organization
                                            .slug,

                                    status:
                                        membership
                                            .organization
                                            .status
                                }
                                : null
                    })
                ) || []
        };
    }

    async changePassword({
        userId,
        currentSessionId,
        currentPassword,
        newPassword,
        confirmPassword
    }) {
        if (
            !currentPassword ||
            !newPassword ||
            !confirmPassword
        ) {
            throw new AppException(
                "Current password, new password and confirmation are required.",
                400,
                "PASSWORD_FIELDS_REQUIRED"
            );
        }

        if (
            newPassword !==
            confirmPassword
        ) {
            throw new AppException(
                "New password and confirmation do not match.",
                400,
                "PASSWORD_MISMATCH"
            );
        }

        if (
            newPassword.length < 8
        ) {
            throw new AppException(
                "New password must be at least 8 characters long.",
                400,
                "PASSWORD_TOO_SHORT"
            );
        }

        const user =
            await User.findByPk(
                userId
            );

        if (!user) {
            throw new AppException(
                "User not found.",
                404,
                "USER_NOT_FOUND"
            );
        }

        const passwordMatches =
            await bcrypt.compare(
                currentPassword,
                user.password
            );

        if (!passwordMatches) {
            throw new AppException(
                "Current password is incorrect.",
                401,
                "INVALID_CURRENT_PASSWORD"
            );
        }

        const samePassword =
            await bcrypt.compare(
                newPassword,
                user.password
            );

        if (samePassword) {
            throw new AppException(
                "New password must be different from the current password.",
                400,
                "PASSWORD_NOT_CHANGED"
            );
        }

        const hashedPassword =
            await bcrypt.hash(
                newPassword,
                12
            );

        await user.update({
            password:
                hashedPassword
        });

        /*
         * Revoke every session except
         * the session changing the password.
         */
        await Session.update(
            {
                status: false,
                revoked_at:
                    new Date()
            },
            {
                where: {
                    user_id:
                        userId,

                    id: {
                        [Op.ne]:
                            currentSessionId
                    },

                    status: true,

                    revoked_at:
                        null
                }
            }
        );

        return {
            message:
                "Password changed successfully."
        };
    }

    async forgotPassword({
        email
    }) {
        const genericResponse = {
            message:
                "If an account exists for that email, a verification code has been sent."
        };

        if (
            !email ||
            !String(email).trim()
        ) {
            throw new AppException(
                "Email is required.",
                422,
                "EMAIL_REQUIRED"
            );
        }

        const normalizedEmail =
            String(email)
                .trim()
                .toLowerCase();

        const user =
            await User.findOne({
                where: {
                    email:
                        normalizedEmail,

                    status:
                        true
                }
            });

        /*
         * Do not reveal whether
         * the email exists.
         */
        if (!user) {
            return genericResponse;
        }

        /*
         * Invalidate older unused
         * reset requests.
         */
        await PasswordResetRequest.update(
            {
                status: false
            },
            {
                where: {
                    user_id:
                        user.id,

                    status:
                        true,

                    consumed_at:
                        null
                }
            }
        );

        const otp =
            generateOtp();

        const otpHash =
            await bcrypt.hash(
                otp,
                12
            );

        const expiresAt =
            new Date(
                Date.now() +
                (
                    Number(
                        process.env
                            .PASSWORD_RESET_OTP_EXPIRES_MINUTES ||
                        10
                    ) *
                    60 *
                    1000
                )
            );

        await PasswordResetRequest.create({
            user_id:
                user.id,

            email:
                user.email,

            otp_hash:
                otpHash,

            expires_at:
                expiresAt,

            attempts:
                0,

            status:
                true
        });

        const mailConfigured =
            Boolean(
                process.env.MAIL_HOST &&
                process.env.MAIL_USERNAME &&
                process.env.MAIL_PASSWORD
            );

        const mailDebug =
            String(
                process.env.MAIL_DEBUG
            ).toLowerCase() ===
            "true";

        if (mailConfigured) {
            await mailService.sendPasswordResetOtp({
                email:
                    user.email,

                name:
                    user.name,

                otp
            });
        } else if (
            process.env.NODE_ENV ===
            "development" &&
            mailDebug
        ) {
            console.log(
                "──────── SENTINEL RESET OTP ────────"
            );

            console.log(
                `Email: ${user.email}`
            );

            console.log(
                `OTP: ${otp}`
            );

            console.log(
                `Expires: ${expiresAt.toISOString()}`
            );

            console.log(
                "────────────────────────────────────"
            );
        }

        return genericResponse;
    }

    async verifyResetOtp({
        email,
        otp
    }) {
        if (!email || !otp) {
            throw new AppException(
                "Email and verification code are required.",
                400,
                "RESET_OTP_REQUIRED"
            );
        }

        const normalizedEmail =
            String(email)
                .trim()
                .toLowerCase();

        const resetRequest =
            await PasswordResetRequest.findOne({
                where: {
                    email:
                        normalizedEmail,

                    status:
                        true,

                    verified_at:
                        null,

                    consumed_at:
                        null
                },

                order: [
                    [
                        "id",
                        "DESC"
                    ]
                ]
            });

        if (!resetRequest) {
            throw new AppException(
                "The verification code is invalid or no longer available.",
                400,
                "INVALID_RESET_OTP"
            );
        }

        if (
            new Date(
                resetRequest.expires_at
            ) <= new Date()
        ) {
            await resetRequest.update({
                status:
                    false
            });

            throw new AppException(
                "The verification code has expired.",
                400,
                "RESET_OTP_EXPIRED"
            );
        }

        const maxAttempts =
            Number(
                process.env
                    .PASSWORD_RESET_MAX_ATTEMPTS ||
                5
            );

        if (
            resetRequest.attempts >=
            maxAttempts
        ) {
            await resetRequest.update({
                status:
                    false
            });

            throw new AppException(
                "Too many invalid verification attempts. Request a new code.",
                429,
                "RESET_OTP_ATTEMPTS_EXCEEDED"
            );
        }

        const otpMatches =
            await bcrypt.compare(
                String(otp),
                resetRequest.otp_hash
            );

        if (!otpMatches) {
            const attempts =
                resetRequest.attempts +
                1;

            await resetRequest.update({
                attempts
            });

            if (
                attempts >=
                maxAttempts
            ) {
                await resetRequest.update({
                    status:
                        false
                });

                throw new AppException(
                    "Too many invalid verification attempts. Request a new code.",
                    429,
                    "RESET_OTP_ATTEMPTS_EXCEEDED"
                );
            }

            throw new AppException(
                "The verification code is invalid.",
                400,
                "INVALID_RESET_OTP"
            );
        }

        const resetToken =
            generatePasswordResetToken();

        const resetTokenHash =
            hashPasswordResetToken(
                resetToken
            );

        const resetTokenExpiresAt =
            new Date(
                Date.now() +
                (
                    Number(
                        process.env
                            .PASSWORD_RESET_TOKEN_EXPIRES_MINUTES ||
                        10
                    ) *
                    60 *
                    1000
                )
            );

        await resetRequest.update({
            verified_at:
                new Date(),

            reset_token_hash:
                resetTokenHash,

            reset_token_expires_at:
                resetTokenExpiresAt
        });

        return {
            resetToken,
            expiresAt:
                resetTokenExpiresAt
        };
    }

    async resetPassword({
        resetToken,
        password,
        confirmPassword
    }) {
        if (!resetToken) {
            throw new AppException(
                "Password reset token is required.",
                400,
                "RESET_TOKEN_REQUIRED"
            );
        }

        if (
            !password ||
            !confirmPassword
        ) {
            throw new AppException(
                "Password and confirmation are required.",
                400,
                "PASSWORD_FIELDS_REQUIRED"
            );
        }

        if (
            password !==
            confirmPassword
        ) {
            throw new AppException(
                "Password and confirmation do not match.",
                400,
                "PASSWORD_MISMATCH"
            );
        }

        if (
            password.length < 8
        ) {
            throw new AppException(
                "Password must be at least 8 characters long.",
                400,
                "PASSWORD_TOO_SHORT"
            );
        }

        const resetTokenHash =
            hashPasswordResetToken(
                resetToken
            );

        const resetRequest =
            await PasswordResetRequest.findOne({
                where: {
                    reset_token_hash:
                        resetTokenHash,

                    status:
                        true,

                    consumed_at:
                        null
                }
            });

        if (!resetRequest) {
            throw new AppException(
                "The password reset token is invalid or has already been used.",
                400,
                "INVALID_RESET_TOKEN"
            );
        }

        if (
            !resetRequest.verified_at
        ) {
            throw new AppException(
                "Email verification is required before resetting the password.",
                400,
                "RESET_OTP_NOT_VERIFIED"
            );
        }

        if (
            !resetRequest
                .reset_token_expires_at ||
            new Date(
                resetRequest
                    .reset_token_expires_at
            ) <= new Date()
        ) {
            await resetRequest.update({
                status: false
            });

            throw new AppException(
                "The password reset token has expired.",
                400,
                "RESET_TOKEN_EXPIRED"
            );
        }

        const user =
            await User.findByPk(
                resetRequest.user_id
            );

        if (!user) {
            throw new AppException(
                "User not found.",
                404,
                "USER_NOT_FOUND"
            );
        }

        const samePassword =
            await bcrypt.compare(
                password,
                user.password
            );

        if (samePassword) {
            throw new AppException(
                "New password must be different from the current password.",
                400,
                "PASSWORD_NOT_CHANGED"
            );
        }

        const passwordHash =
            await bcrypt.hash(
                password,
                12
            );

        const transaction =
            await sequelize.transaction();

        try {
            /*
             * Update password.
             */
            await user.update(
                {
                    password:
                        passwordHash
                },
                {
                    transaction
                }
            );

            /*
             * Consume this reset request.
             *
             * The reset token can never
             * be used again.
             */
            await resetRequest.update(
                {
                    consumed_at:
                        new Date(),

                    status:
                        false
                },
                {
                    transaction
                }
            );

            /*
             * Revoke EVERY login session.
             *
             * Password recovery is treated
             * more strictly than a normal
             * password change.
             */
            await Session.update(
                {
                    status:
                        false,

                    revoked_at:
                        new Date()
                },
                {
                    where: {
                        user_id:
                            user.id,

                        status:
                            true,

                        revoked_at:
                            null
                    },

                    transaction
                }
            );

            /*
             * Invalidate any other
             * password-reset requests.
             */
            await PasswordResetRequest.update(
                {
                    status:
                        false
                },
                {
                    where: {
                        user_id:
                            user.id,

                        status:
                            true
                    },

                    transaction
                }
            );

            await transaction.commit();

            return {
                message:
                    "Password reset successfully. Please sign in with your new password."
            };
        } catch (error) {
            await transaction.rollback();

            throw error;
        }
    }

    async resendResetOtp({
        email
    }) {
        if (
            !email ||
            !String(email).trim()
        ) {
            throw new AppException(
                "Email is required.",
                422,
                "EMAIL_REQUIRED"
            );
        }

        const normalizedEmail =
            String(email)
                .trim()
                .toLowerCase();

        const genericResponse = {
            message:
                "If an account exists for that email, a verification code has been sent."
        };

        const user =
            await User.findOne({
                where: {
                    email:
                        normalizedEmail,

                    status:
                        true
                }
            });

        if (!user) {
            return genericResponse;
        }

        const latestRequest =
            await PasswordResetRequest.findOne({
                where: {
                    user_id:
                        user.id
                },

                order: [
                    [
                        "id",
                        "DESC"
                    ]
                ]
            });

        const cooldownSeconds =
            Number(
                process.env
                    .PASSWORD_RESET_RESEND_COOLDOWN_SECONDS ||
                60
            );

        if (
            latestRequest &&
            latestRequest.created_at
        ) {
            const elapsedSeconds =
                Math.floor(
                    (
                        Date.now() -
                        new Date(
                            latestRequest.created_at
                        ).getTime()
                    ) /
                    1000
                );

            if (
                elapsedSeconds <
                cooldownSeconds
            ) {
                throw new AppException(
                    `Please wait ${cooldownSeconds -
                    elapsedSeconds
                    } seconds before requesting another code.`,
                    429,
                    "RESET_OTP_COOLDOWN"
                );
            }
        }

        /*
         * Reuse the normal forgot-password
         * flow after cooldown succeeds.
         */
        return this.forgotPassword({
            email:
                normalizedEmail
        });
    }

    async createEmailVerificationOtp(
        user
    ) {
        await EmailVerificationRequest.update(
            {
                status:
                    false
            },
            {
                where: {
                    user_id:
                        user.id,

                    status:
                        true,

                    consumed_at:
                        null
                }
            }
        );

        const otp =
            generateOtp();

        const otpHash =
            await bcrypt.hash(
                otp,
                12
            );

        const expiresMinutes =
            Number(
                process.env
                    .EMAIL_VERIFICATION_OTP_EXPIRES_MINUTES ||
                10
            );

        const expiresAt =
            new Date(
                Date.now() +
                expiresMinutes *
                60 *
                1000
            );

        await EmailVerificationRequest.create({
            user_id:
                user.id,

            email:
                user.email,

            otp_hash:
                otpHash,

            expires_at:
                expiresAt,

            attempts:
                0
        });

        const mailConfigured =
            Boolean(
                process.env.MAIL_HOST &&
                process.env.MAIL_USERNAME &&
                process.env.MAIL_PASSWORD
            );

        if (mailConfigured) {
            try {
                await mailService
                    .sendEmailVerificationOtp({
                        email:
                            user.email,

                        name:
                            user.name,

                        otp
                    });
            } catch (
            error
            ) {
                console.error(
                    "Email verification mail failed:",
                    error.message
                );
            }
        } else if (
            process.env.NODE_ENV ===
            "development" &&
            String(
                process.env
                    .MAIL_DEBUG
            ).toLowerCase() ===
            "true"
        ) {
            console.log(
                "\n========== SENTINEL EMAIL VERIFICATION =========="
            );

            console.log(
                `Email: ${user.email}`
            );

            console.log(
                `OTP: ${otp}`
            );

            console.log(
                `Expires: ${expiresAt.toISOString()}`
            );

            console.log(
                "=================================================\n"
            );
        }

        return {
            expiresAt
        };
    }

    async verifyEmail({
        email,
        otp
    }) {
        if (
            !email ||
            !String(email).trim()
        ) {
            throw new AppException(
                "Email is required.",
                422,
                "EMAIL_REQUIRED"
            );
        }

        if (
            !otp ||
            !String(otp).trim()
        ) {
            throw new AppException(
                "Verification code is required.",
                422,
                "OTP_REQUIRED"
            );
        }

        const normalizedEmail =
            String(email)
                .trim()
                .toLowerCase();

        const user =
            await User.findOne({
                where: {
                    email:
                        normalizedEmail
                }
            });

        if (!user) {
            throw new AppException(
                "The verification code is invalid.",
                400,
                "INVALID_VERIFICATION_OTP"
            );
        }

        if (
            user.email_verified_at
        ) {
            return {
                message:
                    "Email address is already verified."
            };
        }

        const request =
            await EmailVerificationRequest.findOne({
                where: {
                    user_id:
                        user.id,

                    email:
                        normalizedEmail,

                    status:
                        true,

                    verified_at:
                        null,

                    consumed_at:
                        null
                },

                order: [
                    [
                        "id",
                        "DESC"
                    ]
                ]
            });

        if (!request) {
            throw new AppException(
                "The verification code is invalid.",
                400,
                "INVALID_VERIFICATION_OTP"
            );
        }

        if (
            new Date(
                request.expires_at
            ) <= new Date()
        ) {
            await request.update({
                status:
                    false
            });

            throw new AppException(
                "The verification code has expired.",
                400,
                "VERIFICATION_OTP_EXPIRED"
            );
        }

        const maxAttempts =
            Number(
                process.env
                    .EMAIL_VERIFICATION_MAX_ATTEMPTS ||
                5
            );

        if (
            request.attempts >=
            maxAttempts
        ) {
            await request.update({
                status:
                    false
            });

            throw new AppException(
                "Too many verification attempts. Please request a new code.",
                429,
                "VERIFICATION_OTP_ATTEMPTS_EXCEEDED"
            );
        }

        const validOtp =
            await bcrypt.compare(
                String(otp),
                request.otp_hash
            );

        if (!validOtp) {
            const attempts =
                request.attempts +
                1;

            await request.update({
                attempts,

                status:
                    attempts <
                    maxAttempts
            });

            if (
                attempts >=
                maxAttempts
            ) {
                throw new AppException(
                    "Too many verification attempts. Please request a new code.",
                    429,
                    "VERIFICATION_OTP_ATTEMPTS_EXCEEDED"
                );
            }

            throw new AppException(
                "The verification code is invalid.",
                400,
                "INVALID_VERIFICATION_OTP"
            );
        }

        const now =
            new Date();

        const transaction =
            await sequelize.transaction();

        try {
            await user.update(
                {
                    email_verified_at:
                        now
                },
                {
                    transaction
                }
            );

            await request.update(
                {
                    verified_at:
                        now,

                    consumed_at:
                        now,

                    status:
                        false
                },
                {
                    transaction
                }
            );

            await EmailVerificationRequest.update(
                {
                    status:
                        false
                },
                {
                    where: {
                        user_id:
                            user.id,

                        status:
                            true
                    },

                    transaction
                }
            );

            await transaction.commit();

            return {
                message:
                    "Email verified successfully."
            };
        } catch (
        error
        ) {
            await transaction.rollback();

            throw error;
        }
    }

    async resendEmailVerificationOtp({
        email
    }) {
        if (
            !email ||
            !String(email).trim()
        ) {
            throw new AppException(
                "Email is required.",
                422,
                "EMAIL_REQUIRED"
            );
        }

        const normalizedEmail =
            String(email)
                .trim()
                .toLowerCase();

        const genericResponse = {
            message:
                "If the account exists and is not verified, a verification code has been sent."
        };

        const user =
            await User.findOne({
                where: {
                    email:
                        normalizedEmail,

                    status:
                        true
                }
            });

        if (
            !user ||
            user.email_verified_at
        ) {
            return genericResponse;
        }

        const latestRequest =
            await EmailVerificationRequest.findOne({
                where: {
                    user_id:
                        user.id
                },

                order: [
                    [
                        "id",
                        "DESC"
                    ]
                ]
            });

        const cooldown =
            Number(
                process.env
                    .EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS ||
                60
            );

        if (
            latestRequest &&
            latestRequest.created_at
        ) {
            const elapsed =
                Math.floor(
                    (
                        Date.now() -
                        new Date(
                            latestRequest.created_at
                        ).getTime()
                    ) /
                    1000
                );

            if (
                elapsed <
                cooldown
            ) {
                throw new AppException(
                    `Please wait ${cooldown -
                    elapsed
                    } seconds before requesting another code.`,
                    429,
                    "EMAIL_VERIFICATION_COOLDOWN"
                );
            }
        }

        await this.createEmailVerificationOtp(
            user
        );

        return genericResponse;
    }
}

export default new AuthService();