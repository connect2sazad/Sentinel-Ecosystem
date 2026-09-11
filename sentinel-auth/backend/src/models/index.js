import User from "./user.model.js";
import Organization from "./organization.model.js";
import OrganizationMember from "./organization-member.model.js";
import Session from "./session.model.js";
import PasswordResetRequest from "./password-reset-request.model.js";
import EmailVerificationRequest from "./email-verification-request.model.js";
import OrganizationRequest from "./organization-request.model.js";
import OrganizationInvitation from "./organization-invitation.model.js";

User.belongsToMany(
    Organization,
    {
        through: OrganizationMember,
        foreignKey: "user_id",
        otherKey: "organization_id",
        as: "organizations"
    }
);

Organization.belongsToMany(
    User,
    {
        through: OrganizationMember,
        foreignKey: "organization_id",
        otherKey: "user_id",
        as: "users"
    }
);

OrganizationMember.belongsTo(
    User,
    {
        foreignKey: "user_id",
        as: "user"
    }
);

OrganizationMember.belongsTo(
    Organization,
    {
        foreignKey: "organization_id",
        as: "organization"
    }
);

User.hasMany(
    OrganizationMember,
    {
        foreignKey: "user_id",
        as: "memberships"
    }
);

Organization.hasMany(
    OrganizationMember,
    {
        foreignKey: "organization_id",
        as: "members"
    }
);

User.hasMany(
    Session,
    {
        foreignKey: "user_id",
        as: "sessions"
    }
);

Session.belongsTo(
    User,
    {
        foreignKey: "user_id",
        as: "user"
    }
);

User.hasMany(
    PasswordResetRequest,
    {
        foreignKey:
            "user_id",

        as:
            "password_reset_requests"
    }
);

PasswordResetRequest.belongsTo(
    User,
    {
        foreignKey:
            "user_id",

        as:
            "user"
    }
);

User.hasMany(
    EmailVerificationRequest,
    {
        foreignKey:
            "user_id",

        as:
            "email_verification_requests"
    }
);

EmailVerificationRequest.belongsTo(
    User,
    {
        foreignKey:
            "user_id",

        as:
            "user"
    }
);

User.hasMany(
    OrganizationRequest,
    {
        foreignKey:
            "requested_by_user_id",

        as:
            "organization_requests"
    }
);

OrganizationRequest.belongsTo(
    User,
    {
        foreignKey:
            "requested_by_user_id",

        as:
            "requester"
    }
);

User.hasMany(
    OrganizationRequest,
    {
        foreignKey:
            "reviewed_by_user_id",

        as:
            "reviewed_organization_requests"
    }
);

OrganizationRequest.belongsTo(
    User,
    {
        foreignKey:
            "reviewed_by_user_id",

        as:
            "reviewer"
    }
);

Organization.hasMany(OrganizationInvitation, {
    foreignKey: "organization_id",
    as: "invitations"
});

OrganizationInvitation.belongsTo(Organization, {
    foreignKey: "organization_id",
    as: "organization"
});

OrganizationInvitation.belongsTo(User, {
    foreignKey: "invited_by_user_id",
    as: "inviter"
});

OrganizationInvitation.belongsTo(User, {
    foreignKey: "accepted_by_user_id",
    as: "recipient"
});

const models = {
    User,
    Organization,
    OrganizationMember,
    OrganizationRequest,
    Session,
    PasswordResetRequest,
    EmailVerificationRequest,
    OrganizationInvitation
};

export {
    User,
    Organization,
    OrganizationMember,
    OrganizationRequest,
    Session,
    PasswordResetRequest,
    EmailVerificationRequest,
    OrganizationInvitation
};

export default models;