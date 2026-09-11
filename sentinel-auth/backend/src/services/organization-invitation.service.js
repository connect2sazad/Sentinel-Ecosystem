import crypto
    from "node:crypto";

import {
    Op
} from "sequelize";

import sequelize
    from "../config/database.js";

import OrganizationInvitation
    from "../models/organization-invitation.model.js";

import OrganizationMember
    from "../models/organization-member.model.js";

import Organization
    from "../models/organization.model.js";

import User
    from "../models/user.model.js";

import AppException
    from "../utils/app-exception.js";


const generateInvitationToken =
    () => {
        return crypto
            .randomBytes(64)
            .toString("hex");
    };


const hashInvitationToken =
    (
        token
    ) => {
        return crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");
    };


class OrganizationInvitationService {
    async createInvitation(
        organizationId,
        invitedByUserId,
        email
    ) {
        const normalizedEmail =
            email
                ?.trim()
                .toLowerCase();

        if (!normalizedEmail) {
            throw new AppException(
                "Email address is required.",
                422,
                "EMAIL_REQUIRED"
            );
        }

        const organization =
            await Organization.findByPk(
                organizationId
            );

        if (!organization) {
            throw new AppException(
                "Organization not found.",
                404,
                "ORGANIZATION_NOT_FOUND"
            );
        }

        const existingUser =
            await User.findOne({
                where: {
                    email:
                        normalizedEmail
                }
            });

        if (existingUser) {
            const existingMembership =
                await OrganizationMember.findOne({
                    where: {
                        organization_id:
                            organizationId,

                        user_id:
                            existingUser.id,

                        status:
                            true
                    }
                });

            if (existingMembership) {
                throw new AppException(
                    "This user is already a member of the organization.",
                    409,
                    "USER_ALREADY_ORGANIZATION_MEMBER"
                );
            }
        }

        const existingInvitation =
            await OrganizationInvitation.findOne({
                where: {
                    organization_id:
                        organizationId,

                    email:
                        normalizedEmail,

                    accepted_at:
                        null,

                    revoked_at:
                        null,

                    expires_at: {
                        [Op.gt]:
                            new Date()
                    },

                    status:
                        true
                }
            });

        if (existingInvitation) {
            throw new AppException(
                "An active invitation already exists for this email address.",
                409,
                "ACTIVE_INVITATION_ALREADY_EXISTS"
            );
        }

        const invitationToken =
            generateInvitationToken();

        const invitationTokenHash =
            hashInvitationToken(
                invitationToken
            );

        const expiresAt =
            new Date(
                Date.now() +
                (
                    7 *
                    24 *
                    60 *
                    60 *
                    1000
                )
            );

        const invitation =
            await OrganizationInvitation.create({
                organization_id:
                    organizationId,

                email:
                    normalizedEmail,

                role:
                    "member",

                token_hash:
                    invitationTokenHash,

                invited_by_user_id:
                    invitedByUserId,

                expires_at:
                    expiresAt,

                accepted_at:
                    null,

                revoked_at:
                    null,

                status:
                    true
            });

        return {
            invitation: {
                id:
                    invitation.id,

                organization_id:
                    invitation.organization_id,

                email:
                    invitation.email,

                role:
                    invitation.role,

                expires_at:
                    invitation.expires_at,

                created_at:
                    invitation.created_at
            },

            invitation_token:
                invitationToken
        };
    }


    async getOrganizationInvitations(
        organizationId
    ) {
        const organization =
            await Organization.findByPk(
                organizationId
            );

        if (!organization) {
            throw new AppException(
                "Organization not found.",
                404,
                "ORGANIZATION_NOT_FOUND"
            );
        }

        return OrganizationInvitation.findAll({
            where: {
                organization_id:
                    organizationId
            },

            include: [
                {
                    model:
                        User,

                    as:
                        "inviter",

                    attributes: [
                        "id",
                        "name",
                        "email",
                        "username"
                    ],

                    required:
                        false
                }
            ],

            order: [
                [
                    "id",
                    "DESC"
                ]
            ]
        });
    }


    async revokeInvitation(
        organizationId,
        invitationId
    ) {
        const invitation =
            await OrganizationInvitation.findOne({
                where: {
                    id:
                        invitationId,

                    organization_id:
                        organizationId
                }
            });

        if (!invitation) {
            throw new AppException(
                "Organization invitation not found.",
                404,
                "ORGANIZATION_INVITATION_NOT_FOUND"
            );
        }

        if (
            invitation.accepted_at
        ) {
            throw new AppException(
                "Accepted invitations cannot be revoked.",
                409,
                "INVITATION_ALREADY_ACCEPTED"
            );
        }

        if (
            invitation.revoked_at
        ) {
            throw new AppException(
                "Invitation has already been revoked.",
                409,
                "INVITATION_ALREADY_REVOKED"
            );
        }

        await invitation.update({
            revoked_at:
                new Date(),

            status:
                false
        });

        return invitation;
    }


    async acceptInvitation(
        userId,
        rawToken
    ) {
        const token =
            rawToken
                ?.trim();

        if (!token) {
            throw new AppException(
                "Invitation token is required.",
                422,
                "INVITATION_TOKEN_REQUIRED"
            );
        }

        const tokenHash =
            hashInvitationToken(
                token
            );

        return sequelize.transaction(
            async (
                transaction
            ) => {
                const invitation =
                    await OrganizationInvitation.findOne({
                        where: {
                            token_hash:
                                tokenHash
                        },

                        transaction,

                        lock:
                            transaction.LOCK.UPDATE
                    });

                if (!invitation) {
                    throw new AppException(
                        "Invalid organization invitation.",
                        404,
                        "ORGANIZATION_INVITATION_NOT_FOUND"
                    );
                }

                if (
                    invitation.revoked_at
                ) {
                    throw new AppException(
                        "This invitation has been revoked.",
                        409,
                        "INVITATION_REVOKED"
                    );
                }

                if (
                    invitation.accepted_at
                ) {
                    throw new AppException(
                        "This invitation has already been accepted.",
                        409,
                        "INVITATION_ALREADY_ACCEPTED"
                    );
                }

                if (
                    invitation.status !==
                    true
                ) {
                    throw new AppException(
                        "This invitation is no longer active.",
                        409,
                        "INVITATION_INACTIVE"
                    );
                }

                if (
                    new Date(
                        invitation.expires_at
                    ) <=
                    new Date()
                ) {
                    throw new AppException(
                        "This invitation has expired.",
                        410,
                        "INVITATION_EXPIRED"
                    );
                }

                const user =
                    await User.findByPk(
                        userId,
                        {
                            transaction,

                            lock:
                                transaction.LOCK.UPDATE
                        }
                    );

                if (!user) {
                    throw new AppException(
                        "User account not found.",
                        404,
                        "USER_NOT_FOUND"
                    );
                }

                if (
                    user.status !==
                    true
                ) {
                    throw new AppException(
                        "User account is unavailable.",
                        403,
                        "ACCOUNT_UNAVAILABLE"
                    );
                }

                if (
                    !user.email_verified_at
                ) {
                    throw new AppException(
                        "Please verify your email before accepting an invitation.",
                        403,
                        "EMAIL_NOT_VERIFIED"
                    );
                }

                if (
                    user.email
                        ?.trim()
                        .toLowerCase() !==
                    invitation.email
                        ?.trim()
                        .toLowerCase()
                ) {
                    throw new AppException(
                        "This invitation was issued to a different email address.",
                        403,
                        "INVITATION_EMAIL_MISMATCH"
                    );
                }

                const organization =
                    await Organization.findByPk(
                        invitation.organization_id,
                        {
                            transaction
                        }
                    );

                if (!organization) {
                    throw new AppException(
                        "Organization not found.",
                        404,
                        "ORGANIZATION_NOT_FOUND"
                    );
                }

                const existingMembership =
                    await OrganizationMember.findOne({
                        where: {
                            organization_id:
                                invitation.organization_id,

                            user_id:
                                user.id
                        },

                        transaction,

                        lock:
                            transaction.LOCK.UPDATE
                    });

                if (existingMembership) {
                    if (
                        existingMembership.status ===
                        true
                    ) {
                        throw new AppException(
                            "You are already a member of this organization.",
                            409,
                            "ALREADY_ORGANIZATION_MEMBER"
                        );
                    }

                    await existingMembership.update(
                        {
                            role:
                                invitation.role ||
                                "member",

                            joined_at:
                                new Date(),

                            status:
                                true
                        },
                        {
                            transaction
                        }
                    );
                } else {
                    await OrganizationMember.create(
                        {
                            organization_id:
                                invitation.organization_id,

                            user_id:
                                user.id,

                            role:
                                invitation.role ||
                                "member",

                            joined_at:
                                new Date(),

                            status:
                                true
                        },
                        {
                            transaction
                        }
                    );
                }

                await invitation.update(
                    {
                        accepted_by_user_id:
                            user.id,

                        accepted_at:
                            new Date(),

                        status:
                            false
                    },
                    {
                        transaction
                    }
                );

                return {
                    organization: {
                        id:
                            organization.id,

                        name:
                            organization.name,

                        slug:
                            organization.slug
                    },

                    membership: {
                        organization_id:
                            organization.id,

                        user_id:
                            user.id,

                        role:
                            invitation.role ||
                            "member"
                    }
                };
            }
        );
    }
}

export default new OrganizationInvitationService();