import {
    Router
} from "express";

import adminOrganizationController
    from "../controllers/admin-organization.controller.js";

import authenticate
    from "../middlewares/auth.middleware.js";

import requirePlatformAdmin
    from "../middlewares/platform-admin.middleware.js";

import asyncHandler
    from "../utils/async-handler.js";

const router =
    Router();

router.use(
    authenticate
);

router.use(
    asyncHandler(
        requirePlatformAdmin
    )
);

router.get(
    "/organization-requests",
    asyncHandler(
        adminOrganizationController
            .getRequests
            .bind(
                adminOrganizationController
            )
    )
);

router.get(
    "/organization-requests/:id",
    asyncHandler(
        adminOrganizationController
            .getRequestById
            .bind(
                adminOrganizationController
            )
    )
);

router.post(
    "/organization-requests/:id/approve",
    asyncHandler(
        adminOrganizationController
            .approveRequest
            .bind(
                adminOrganizationController
            )
    )
);

router.post(
    "/organization-requests/:id/reject",
    asyncHandler(
        adminOrganizationController
            .rejectRequest
            .bind(
                adminOrganizationController
            )
    )
);

export default router;