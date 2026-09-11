import {
    Router
} from "express";

import organizationController
    from "../controllers/organization.controller.js";

import invitationController
    from "../controllers/organization-invitation.controller.js";

import authenticate
    from "../middlewares/auth.middleware.js";

import requirePlatformAdmin
    from "../middlewares/platform-admin.middleware.js";

import requireOrganizationAdmin
    from "../middlewares/organization-admin.middleware.js";

import asyncHandler
    from "../utils/async-handler.js";


const router =
    Router();


/*
|--------------------------------------------------------------------------
| User Organization Requests
|--------------------------------------------------------------------------
*/

router.post(
    "/requests",
    asyncHandler(
        authenticate
    ),
    asyncHandler(
        organizationController
            .requestOrganization
            .bind(
                organizationController
            )
    )
);


router.get(
    "/requests/me",
    asyncHandler(
        authenticate
    ),
    asyncHandler(
        organizationController
            .getMyRequests
            .bind(
                organizationController
            )
    )
);


/*
|--------------------------------------------------------------------------
| Platform Admin Organization Requests
|--------------------------------------------------------------------------
*/

router.get(
    "/requests",
    asyncHandler(
        authenticate
    ),
    asyncHandler(
        requirePlatformAdmin
    ),
    asyncHandler(
        organizationController
            .listRequests
            .bind(
                organizationController
            )
    )
);


router.post(
    "/requests/:id/approve",
    asyncHandler(
        authenticate
    ),
    asyncHandler(
        requirePlatformAdmin
    ),
    asyncHandler(
        organizationController
            .approveRequest
            .bind(
                organizationController
            )
    )
);


router.post(
    "/requests/:id/reject",
    asyncHandler(
        authenticate
    ),
    asyncHandler(
        requirePlatformAdmin
    ),
    asyncHandler(
        organizationController
            .rejectRequest
            .bind(
                organizationController
            )
    )
);


/*
|--------------------------------------------------------------------------
| Organization Invitations
|--------------------------------------------------------------------------
*/

router.post(
    "/:organizationId/invitations",
    asyncHandler(
        authenticate
    ),
    asyncHandler(
        requireOrganizationAdmin
    ),
    asyncHandler(
        invitationController
            .createInvitation
            .bind(
                invitationController
            )
    )
);


router.get(
    "/:organizationId/invitations",
    asyncHandler(
        authenticate
    ),
    asyncHandler(
        requireOrganizationAdmin
    ),
    asyncHandler(
        invitationController
            .getInvitations
            .bind(
                invitationController
            )
    )
);


router.delete(
    "/:organizationId/invitations/:invitationId",
    asyncHandler(
        authenticate
    ),
    asyncHandler(
        requireOrganizationAdmin
    ),
    asyncHandler(
        invitationController
            .revokeInvitation
            .bind(
                invitationController
            )
    )
);


router.post(
    "/invitations/accept",
    asyncHandler(
        authenticate
    ),
    asyncHandler(
        invitationController
            .acceptInvitation
            .bind(
                invitationController
            )
    )
);


export default router;