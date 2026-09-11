import {
    Op
} from "sequelize";

import OrganizationRequest
    from "../models/organization-request.model.js";

import Organization
    from "../models/organization.model.js";

import AppException
    from "../utils/app-exception.js";

import { randomUUID } from "node:crypto";
import sequelize from "../config/database.js";
import User from "../models/user.model.js";
import OrganizationMember from "../models/organization-member.model.js";
import { validateOrganizationInput } from "../utils/organization-input.js";

class OrganizationService {
    async requestOrganization(
        userId,
        payload
    ) {
        const {
            name,
            legal_name,
            business_identifier,
            country,
            email,
            website,
            domain
        } = validateOrganizationInput(payload);

        return sequelize.transaction(async transaction => {
        // Serialize submissions from the same account before checking pending requests.
        const requester = await User.findOne({
            where: { id: userId, status: true },
            attributes: ["id", "email_verified_at"],
            transaction,
            lock: transaction.LOCK.UPDATE
        });
        if (!requester?.email_verified_at) {
            throw new AppException("An active, verified account is required.", 403, "REQUESTER_NOT_ELIGIBLE");
        }

        if (!name?.trim()) {
            throw new AppException(
                "Organization name is required.",
                422,
                "ORGANIZATION_NAME_REQUIRED"
            );
        }

        const normalizedName =
            name.trim();

        const normalizedDomain =
            domain
                ?.trim()
                ?.toLowerCase() ||
            null;

        const normalizedBusinessIdentifier =
            business_identifier
                ?.trim() ||
            null;

        const existingOrganization =
            await Organization.findOne({
                transaction,
                where: {
                    [Op.or]: [
                        {
                            name:
                                normalizedName
                        },

                        ...(normalizedDomain
                            ? [
                                {
                                    website: {
                                        [Op.like]:
                                            `%${normalizedDomain}%`
                                    }
                                }
                            ]
                            : [])
                    ]
                }
            });

        if (existingOrganization) {
            throw new AppException(
                "An organization with similar details already exists.",
                409,
                "ORGANIZATION_ALREADY_EXISTS"
            );
        }

        const pendingWhere = {
            requested_by_user_id:
                userId,

            verification_status:
                "pending",

            status:
                true
        };

        const existingPendingRequest =
            await OrganizationRequest.findOne({
                transaction,
                where:
                    pendingWhere
            });

        if (existingPendingRequest) {
            throw new AppException(
                "You already have a pending organization request.",
                409,
                "ORGANIZATION_REQUEST_ALREADY_PENDING"
            );
        }

        if (
            normalizedBusinessIdentifier
        ) {
            const identifierRequest =
                await OrganizationRequest.findOne({
                    transaction,
                    where: {
                        business_identifier:
                            normalizedBusinessIdentifier,

                        verification_status:
                            { [Op.in]: ["pending", "approved"] },

                        status:
                            true
                    }
                });

            if (identifierRequest) {
                throw new AppException(
                    "An organization request with this business identifier already exists.",
                    409,
                    "BUSINESS_IDENTIFIER_ALREADY_REQUESTED"
                );
            }
        }

        const request =
            await OrganizationRequest.create(
                {
                    requested_by_user_id:
                        userId,

                    name:
                        normalizedName,

                    legal_name:
                        legal_name
                            ?.trim() ||
                        null,

                    business_identifier:
                        normalizedBusinessIdentifier,

                    country:
                        country
                            ?.trim() ||
                        null,

                    email:
                        email
                            ?.trim()
                            ?.toLowerCase() ||
                        null,

                    website:
                        website
                            ?.trim() ||
                        null,

                    domain:
                        normalizedDomain,

                    verification_method:
                        "manual",

                    verification_status:
                        "pending"
                },
                { transaction }
            );

        return request;
        });
    }

    async listRequests(query = {}) {
        const verificationStatus = query.verification_status ?? "pending";
        const pageText = String(query.page ?? "1");
        const limitText = String(query.limit ?? "20");

        if (
            !["pending", "approved", "rejected"].includes(verificationStatus) ||
            !/^[1-9]\d*$/.test(pageText) ||
            !/^[1-9]\d*$/.test(limitText)
        ) {
            throw new AppException(
                "Invalid request status or pagination.",
                422,
                "INVALID_REQUEST_FILTERS"
            );
        }

        const page = Number(pageText);
        const limit = Number(limitText);
        const offset = (page - 1) * limit;

        if (
            !Number.isSafeInteger(page) ||
            !Number.isSafeInteger(limit) ||
            limit > 100 ||
            !Number.isSafeInteger(offset)
        ) {
            throw new AppException(
                "Invalid pagination. Limit must be between 1 and 100.",
                422,
                "INVALID_PAGINATION"
            );
        }

        const { rows, count } = await OrganizationRequest.findAndCountAll({
            where: {
                status: true,
                verification_status: verificationStatus
            },
            order: [["id", "DESC"]],
            limit,
            offset
        });

        return {
            requests: rows,
            pagination: {
                page,
                limit,
                total: count,
                total_pages: Math.ceil(count / limit)
            }
        };
    }

    async getMyRequests(
        userId
    ) {
        return OrganizationRequest.findAll({
            where: {
                requested_by_user_id:
                    userId
            },

            order: [
                [
                    "id",
                    "DESC"
                ]
            ]
        });
    }

    async approveRequest(requestId, reviewerId) {
        if (
            typeof requestId !== "string" ||
            !/^[1-9]\d{0,19}$/.test(requestId) ||
            BigInt(requestId) > 18446744073709551615n
        ) {
            throw new AppException(
                "Invalid organization request ID.",
                422,
                "INVALID_REQUEST_ID"
            );
        }

        return sequelize.transaction(async transaction => {
            const request = await OrganizationRequest.findOne({
                where: {
                    id: requestId,
                    status: true
                },
                transaction,
                lock: transaction.LOCK.UPDATE
            });

            if (!request) {
                throw new AppException(
                    "Organization request not found.",
                    404,
                    "ORGANIZATION_REQUEST_NOT_FOUND"
                );
            }

            if (
                request.verification_status !== "pending" ||
                request.organization_id
            ) {
                throw new AppException(
                    "This request has already been reviewed.",
                    409,
                    "ORGANIZATION_REQUEST_ALREADY_REVIEWED"
                );
            }

            const requester = await User.findOne({
                where: {
                    id: request.requested_by_user_id,
                    status: true
                },
                attributes: ["id", "email_verified_at"],
                transaction,
                lock: transaction.LOCK.UPDATE
            });

            if (!requester || !requester.email_verified_at) {
                throw new AppException(
                    "The requester must have an active, verified account.",
                    409,
                    "REQUESTER_NOT_ELIGIBLE"
                );
            }

            const name = request.name.trim();

            if (name.length < 2 || name.length > 150) {
                throw new AppException(
                    "Organization name must contain between 2 and 150 characters.",
                    422,
                    "INVALID_ORGANIZATION_NAME"
                );
            }

            const slugBase = name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "")
                .slice(0, 100) || "organization";

            const organization = await Organization.create({
                name,
                slug: `${slugBase}-${randomUUID()}`,
                legal_name: request.legal_name,
                email: request.email,
                website: request.website
            }, { transaction });

            const membership = await OrganizationMember.create({
                organization_id: organization.id,
                user_id: requester.id,
                role: "owner",
                joined_at: new Date()
            }, { transaction });

            await request.update({
                organization_id: organization.id,
                verification_status: "approved",
                reviewed_by_user_id: reviewerId,
                reviewed_at: new Date(),
                rejection_reason: null
            }, { transaction });

            return {
                request,
                organization,
                membership
            };
        });
    }

    async rejectRequest(requestId, reviewerId, reason) {
        if (
            typeof requestId !== "string" ||
            !/^[1-9]\d{0,19}$/.test(requestId) ||
            BigInt(requestId) > 18446744073709551615n
        ) {
            throw new AppException(
                "Invalid organization request ID.",
                422,
                "INVALID_REQUEST_ID"
            );
        }

        if (
            typeof reason !== "string" ||
            !reason.trim() ||
            reason.trim().length > 2000
        ) {
            throw new AppException(
                "A rejection reason between 1 and 2000 characters is required.",
                422,
                "INVALID_REJECTION_REASON"
            );
        }

        return sequelize.transaction(async transaction => {
            const request = await OrganizationRequest.findOne({
                where: {
                    id: requestId,
                    status: true
                },
                transaction,
                lock: transaction.LOCK.UPDATE
            });

            if (!request) {
                throw new AppException(
                    "Organization request not found.",
                    404,
                    "ORGANIZATION_REQUEST_NOT_FOUND"
                );
            }

            if (
                request.verification_status !== "pending" ||
                request.organization_id
            ) {
                throw new AppException(
                    "This request has already been reviewed.",
                    409,
                    "ORGANIZATION_REQUEST_ALREADY_REVIEWED"
                );
            }

            await request.update({
                verification_status: "rejected",
                reviewed_by_user_id: reviewerId,
                reviewed_at: new Date(),
                rejection_reason: reason.trim()
            }, { transaction });

            return request;
        });
    }
}

export default new OrganizationService();
