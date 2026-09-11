import {
    Op
} from "sequelize";

import sequelize
    from "../config/database.js";

import OrganizationRequest
    from "../models/organization-request.model.js";

import Organization
    from "../models/organization.model.js";

import OrganizationMember
    from "../models/organization-member.model.js";

import User
    from "../models/user.model.js";

import AppException
    from "../utils/app-exception.js";

const slugify = (
    value
) => {
    return value
        .toString()
        .trim()
        .toLowerCase()
        .replace(
            /[^a-z0-9]+/g,
            "-"
        )
        .replace(
            /^-+|-+$/g,
            ""
        );
};

const createUniqueSlug =
    async (
        name,
        transaction
    ) => {
        const base =
            slugify(name) ||
            "organization";

        let slug =
            base;

        let counter =
            1;

        while (
            await Organization.findOne({
                where: {
                    slug
                },

                transaction
            })
        ) {
            counter +=
                1;

            slug =
                `${base}-${counter}`;
        }

        return slug;
    };

class AdminOrganizationService {
    async getRequests(
        status =
            "pending"
    ) {
        const allowedStatuses =
            [
                "pending",
                "approved",
                "rejected",
                "all"
            ];

        if (
            !allowedStatuses.includes(
                status
            )
        ) {
            throw new AppException(
                "Invalid organization request status.",
                422,
                "INVALID_REQUEST_STATUS"
            );
        }

        const where = {};

        if (
            status !== "all"
        ) {
            where.verification_status =
                status;
        }

        return OrganizationRequest.findAll({
            where,

            include: [
                {
                    model:
                        User,

                    as:
                        "requester",

                    attributes: [
                        "id",
                        "name",
                        "email",
                        "username",
                        "status"
                    ]
                },

                {
                    model:
                        User,

                    as:
                        "reviewer",

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

    async getRequestById(
        requestId
    ) {
        const request =
            await OrganizationRequest.findByPk(
                requestId,
                {
                    include: [
                        {
                            model:
                                User,

                            as:
                                "requester",

                            attributes: [
                                "id",
                                "name",
                                "email",
                                "username",
                                "status"
                            ]
                        },

                        {
                            model:
                                User,

                            as:
                                "reviewer",

                            attributes: [
                                "id",
                                "name",
                                "email",
                                "username"
                            ],

                            required:
                                false
                        }
                    ]
                }
            );

        if (!request) {
            throw new AppException(
                "Organization request not found.",
                404,
                "ORGANIZATION_REQUEST_NOT_FOUND"
            );
        }

        return request;
    }

    async approveRequest(
        requestId,
        reviewerUserId
    ) {
        return sequelize.transaction(
            async (
                transaction
            ) => {
                const request =
                    await OrganizationRequest.findByPk(
                        requestId,
                        {
                            transaction,

                            lock:
                                transaction.LOCK.UPDATE
                        }
                    );

                if (!request) {
                    throw new AppException(
                        "Organization request not found.",
                        404,
                        "ORGANIZATION_REQUEST_NOT_FOUND"
                    );
                }

                if (
                    request.verification_status !==
                    "pending"
                ) {
                    throw new AppException(
                        "Only pending organization requests can be approved.",
                        409,
                        "ORGANIZATION_REQUEST_NOT_PENDING"
                    );
                }

                const requester =
                    await User.findByPk(
                        request.requested_by_user_id,
                        {
                            transaction,

                            lock:
                                transaction.LOCK.UPDATE
                        }
                    );

                if (
                    !requester ||
                    requester.status !==
                    true
                ) {
                    throw new AppException(
                        "The requesting account is unavailable.",
                        409,
                        "REQUESTER_UNAVAILABLE"
                    );
                }

                if (
                    request.business_identifier
                ) {
                    const duplicateRequest =
                        await OrganizationRequest.findOne({
                            where: {
                                id: {
                                    [Op.ne]:
                                        request.id
                                },

                                business_identifier:
                                    request.business_identifier,

                                verification_status:
                                    "approved",

                                status:
                                    true
                            },

                            transaction
                        });

                    if (
                        duplicateRequest
                    ) {
                        throw new AppException(
                            "An approved organization already uses this business identifier.",
                            409,
                            "BUSINESS_IDENTIFIER_ALREADY_APPROVED"
                        );
                    }
                }

                const existingOrganization =
                    await Organization.findOne({
                        where: {
                            name:
                                request.name
                        },

                        transaction
                    });

                if (
                    existingOrganization
                ) {
                    throw new AppException(
                        "An organization with this name already exists.",
                        409,
                        "ORGANIZATION_ALREADY_EXISTS"
                    );
                }

                const slug =
                    await createUniqueSlug(
                        request.name,
                        transaction
                    );

                const organization =
                    await Organization.create(
                        {
                            name:
                                request.name,

                            slug,

                            legal_name:
                                request.legal_name,

                            email:
                                request.email,

                            website:
                                request.website
                        },
                        {
                            transaction
                        }
                    );

                await OrganizationMember.create(
                    {
                        organization_id:
                            organization.id,

                        user_id:
                            requester.id,

                        role:
                            "owner",

                        joined_at:
                            new Date()
                    },
                    {
                        transaction
                    }
                );

                await request.update(
                    {
                        verification_status:
                            "approved",

                        reviewed_by_user_id:
                            reviewerUserId,

                        reviewed_at:
                            new Date(),

                        rejection_reason:
                            null
                    },
                    {
                        transaction
                    }
                );

                return {
                    request,
                    organization
                };
            }
        );
    }

    async rejectRequest(
        requestId,
        reviewerUserId,
        reason
    ) {
        const rejectionReason =
            reason?.trim();

        if (
            !rejectionReason
        ) {
            throw new AppException(
                "Rejection reason is required.",
                422,
                "REJECTION_REASON_REQUIRED"
            );
        }

        return sequelize.transaction(
            async (
                transaction
            ) => {
                const request =
                    await OrganizationRequest.findByPk(
                        requestId,
                        {
                            transaction,

                            lock:
                                transaction.LOCK.UPDATE
                        }
                    );

                if (!request) {
                    throw new AppException(
                        "Organization request not found.",
                        404,
                        "ORGANIZATION_REQUEST_NOT_FOUND"
                    );
                }

                if (
                    request.verification_status !==
                    "pending"
                ) {
                    throw new AppException(
                        "Only pending organization requests can be rejected.",
                        409,
                        "ORGANIZATION_REQUEST_NOT_PENDING"
                    );
                }

                await request.update(
                    {
                        verification_status:
                            "rejected",

                        reviewed_by_user_id:
                            reviewerUserId,

                        reviewed_at:
                            new Date(),

                        rejection_reason:
                            rejectionReason
                    },
                    {
                        transaction
                    }
                );

                return request;
            }
        );
    }
}

export default new AdminOrganizationService();