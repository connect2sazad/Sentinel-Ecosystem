import invitationService
    from "../services/organization-invitation.service.js";


class OrganizationInvitationController {
    async createInvitation(
        req,
        res
    ) {
        const result =
            await invitationService
                .createInvitation(
                    req.params.organizationId,
                    req.auth.sub,
                    req.body?.email
                );

        return res
            .set(
                "Cache-Control",
                "no-store"
            )
            .status(201)
            .json({
                success:
                    true,

                message:
                    "Organization invitation created successfully.",

                data:
                    result
            });
    }


    async getInvitations(
        req,
        res
    ) {
        const invitations =
            await invitationService
                .getOrganizationInvitations(
                    req.params.organizationId
                );

        return res
            .status(200)
            .json({
                success:
                    true,

                data:
                    invitations
            });
    }


    async revokeInvitation(
        req,
        res
    ) {
        const invitation =
            await invitationService
                .revokeInvitation(
                    req.params.organizationId,
                    req.params.invitationId
                );

        return res
            .status(200)
            .json({
                success:
                    true,

                message:
                    "Organization invitation revoked successfully.",

                data:
                    invitation
            });
    }


    async acceptInvitation(
        req,
        res
    ) {
        const result =
            await invitationService
                .acceptInvitation(
                    req.auth.sub,
                    req.body?.token
                );

        return res
            .set(
                "Cache-Control",
                "no-store"
            )
            .status(200)
            .json({
                success:
                    true,

                message:
                    "Organization invitation accepted successfully.",

                data:
                    result
            });
    }
}


export default new OrganizationInvitationController();