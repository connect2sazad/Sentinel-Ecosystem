import AppException from "../utils/app-exception.js";

import {
    verifyAccessToken
} from "../utils/token.js";

import {
    Session
} from "../models/index.js";

const authMiddleware = async (
    req,
    res,
    next
) => {
    const authorization =
        req.get("authorization");

    if (!authorization) {
        throw new AppException(
            "Authentication is required.",
            401,
            "AUTHENTICATION_REQUIRED"
        );
    }

    if (
        !authorization.startsWith(
            "Bearer "
        )
    ) {
        throw new AppException(
            "Invalid authorization format.",
            401,
            "INVALID_AUTHORIZATION_FORMAT"
        );
    }

    const token =
        authorization
            .replace(
                /^Bearer\s+/i,
                ""
            )
            .trim();

    let payload;

    try {
        payload =
            verifyAccessToken(
                token
            );
    } catch (error) {
        throw new AppException(
            "Your access token is invalid or expired.",
            401,
            "INVALID_ACCESS_TOKEN"
        );
    }

    const session =
        await Session.findOne({
            where: {
                id:
                    payload.session_id,

                user_id:
                    payload.sub,

                status:
                    true,

                revoked_at:
                    null
            }
        });

    if (!session) {
        throw new AppException(
            "Your session is no longer active.",
            401,
            "SESSION_REVOKED"
        );
    }

    if (
        new Date(
            session.expires_at
        ) <= new Date()
    ) {
        throw new AppException(
            "Your session has expired.",
            401,
            "SESSION_EXPIRED"
        );
    }

    req.auth =
        payload;

    req.session =
        session;

    next();
};

export default authMiddleware;