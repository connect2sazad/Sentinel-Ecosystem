import organizationService
    from "../services/organization.service.js";

class OrganizationController {
    async requestOrganization(
        req,
        res
    ) {
        const request =
            await organizationService
                .requestOrganization(
                    req.auth.sub,
                    req.body
                );

        return res.status(
            201
        ).json({
            success:
                true,

            message:
                "Organization request submitted successfully.",

            data:
                request
        });
    }

    async listRequests(req, res) {
        const result = await organizationService.listRequests(req.query);

        return res.status(200).json({
            success: true,
            data: result
        });
    }

    async getMyRequests(
        req,
        res
    ) {
        const requests =
            await organizationService
                .getMyRequests(
                    req.auth.sub
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

    async approveRequest(req, res) {
        const result = await organizationService.approveRequest(
            req.params.id,
            req.auth.sub
        );

        return res.status(200).json({
            success: true,
            message: "Organization request approved.",
            data: result
        });
    }

    async rejectRequest(req, res) {
        const request = await organizationService.rejectRequest(
            req.params.id,
            req.auth.sub,
            req.body?.rejection_reason
        );

        return res.status(200).json({
            success: true,
            message: "Organization request rejected.",
            data: request
        });
    }
}

export default new OrganizationController();