import User
    from "../models/user.model.js";

import AppException
    from "../utils/app-exception.js";

const requirePlatformAdmin =
    async (
        req,
        res,
        next
    ) => {
        const userId =
            req.auth?.sub;

        if (!userId) {
            throw new AppException(
                "Authentication required.",
                401,
                "AUTHENTICATION_REQUIRED"
            );
        }

        const user =
            await User.findByPk(
                userId
            );

        if (
            !user ||
            user.status !== true
        ) {
            throw new AppException(
                "Account is unavailable.",
                403,
                "ACCOUNT_UNAVAILABLE"
            );
        }

        if (
            user.is_platform_admin !==
            true
        ) {
            throw new AppException(
                "Platform administrator access is required.",
                403,
                "PLATFORM_ADMIN_REQUIRED"
            );
        }

        req.platformAdmin =
            user;

        next();
    };

export default requirePlatformAdmin;