import adminOrganizationService
    from "../services/admin-organization.service.js";

class AdminOrganizationController {
    async getRequests(
        req,
        res
    ) {
        const status =
            req.query.status ||
            "pending";

        const requests =
            await adminOrganizationService
                .getRequests(
                    status
                );

        return res.status(
            200
        ).json({
            success:
                true,

            data:
                requests
        });
    }

    async getRequestById(
        req,
        res
    ) {
        const request =
            await adminOrganizationService
                .getRequestById(
                    req.params.id
                );

        return res.status(
            200
        ).json({
            success:
                true,

            data:
                request
        });
    }

    async approveRequest(
        req,
        res
    ) {
        const result =
            await adminOrganizationService
                .approveRequest(
                    req.params.id,
                    req.auth.sub
                );

        return res.status(
            200
        ).json({
            success:
                true,

            message:
                "Organization request approved successfully.",

            data: {
                request:
                    result.request,

                organization:
                    result.organization
            }
        });
    }

    async rejectRequest(
        req,
        res
    ) {
        const request =
            await adminOrganizationService
                .rejectRequest(
                    req.params.id,
                    req.auth.sub,
                    req.body.reason
                );

        return res.status(
            200
        ).json({
            success:
                true,

            message:
                "Organization request rejected successfully.",

            data:
                request
        });
    }
}

export default new AdminOrganizationController();