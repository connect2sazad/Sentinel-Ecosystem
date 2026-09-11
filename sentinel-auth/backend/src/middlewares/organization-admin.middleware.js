import { Organization, OrganizationMember } from "../models/index.js";
import AppException from "../utils/app-exception.js";

const requireOrganizationAdmin = async (req, res, next) => {
    const userId = req.auth?.sub;
    const organizationId = req.params.organizationId;

    if (!userId) {
        throw new AppException(
            "Authentication is required.",
            401,
            "AUTHENTICATION_REQUIRED"
        );
    }

    if (
        typeof organizationId !== "string" ||
        !/^[1-9]\d{0,19}$/.test(organizationId) ||
        BigInt(organizationId) > 18446744073709551615n
    ) {
        throw new AppException(
            "Invalid organization ID.",
            422,
            "INVALID_ORGANIZATION_ID"
        );
    }

    const membership = await OrganizationMember.findOne({
        where: {
            organization_id: organizationId,
            user_id: userId,
            status: true
        },
        include: [{
            model: Organization,
            as: "organization",
            required: true,
            where: { status: true },
            attributes: ["id"]
        }]
    });

    if (!membership || !["owner", "admin"].includes(membership.role)) {
        throw new AppException(
            "Organization owner or administrator access is required.",
            403,
            "ORGANIZATION_ADMIN_REQUIRED"
        );
    }

    req.organizationMembership = membership;
    next();
};

export default requireOrganizationAdmin;