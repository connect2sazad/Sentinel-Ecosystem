import test from "node:test";
import assert from "node:assert/strict";
import service from "../src/services/organization.service.js";
import authService from "../src/services/auth.service.js";
import sequelize from "../src/config/database.js";
import { User, Session, Organization, OrganizationMember, OrganizationRequest } from "../src/models/index.js";
import authenticate from "../src/middlewares/auth.middleware.js";
import requirePlatformAdmin from "../src/middlewares/platform-admin.middleware.js";
import { generateAccessToken } from "../src/utils/token.js";
import { validateOrganizationInput } from "../src/utils/organization-input.js";

test("invalid organization input returns 422 before database access", async () => {
    for (const payload of [undefined, null, [], {name: 12}, {name: "A"},
        {name: "Valid", domain: "%"}, {name: "Valid", email: "invalid"},
        {name: "Valid", website: "javascript:alert(1)"}, {name: "Valid", country: {}}]) {
        await assert.rejects(service.requestOrganization("1", payload), {statusCode: 422});
    }
    assert.equal(validateOrganizationInput({name: " Example ", domain: "EXAMPLE.COM"}).domain, "example.com");
});

test("account serialization exposes admin permission, not credentials", () => {
    const user = authService.serializeUser({id: "1", is_platform_admin: true, password: "hidden", memberships: []});
    assert.equal(user.is_platform_admin, true);
    assert.deepEqual(user.organizations, []);
    assert.equal(user.password, undefined);
    assert.equal(authService.serializeUser({id: "2"}).is_platform_admin, false);
});

test("invalid review IDs and reasons are rejected", async () => {
    for (const id of ["0", "-1", "abc", "18446744073709551616", 2]) {
        await assert.rejects(service.approveRequest(id, "1"), {statusCode: 422});
    }
    for (const reason of [undefined, {}, " ", "a".repeat(2001)]) {
        await assert.rejects(service.rejectRequest("1", "2", reason), {statusCode: 422});
    }
    await assert.rejects(service.listRequests({limit: "101"}), {statusCode: 422});
});

function fixture(t, status = "pending") {
    const transaction = {LOCK: {UPDATE: "UPDATE"}};
    const request = {id: "12", requested_by_user_id: "7", name: "Example",
        verification_status: status, organization_id: null,
        update: t.mock.fn(async (values, options) => {
            assert.equal(options.transaction, transaction);
            Object.assign(request, values);
            return request;
        })};
    t.mock.method(sequelize, "transaction", async callback => callback(transaction));
    t.mock.method(OrganizationRequest, "findOne", async options => {
        assert.equal(options.lock, "UPDATE");
        assert.equal(options.transaction, transaction);
        return request;
    });
    t.mock.method(User, "findOne", async () => ({id: "7", email_verified_at: new Date()}));
    t.mock.method(Organization, "create", async (values, options) => {
        assert.equal(options.transaction, transaction);
        return {id: "42", ...values};
    });
    t.mock.method(OrganizationMember, "create", async (values, options) => {
        assert.equal(options.transaction, transaction);
        return {id: "43", ...values};
    });
    return request;
}

test("approval writes organization, owner and review in the same transaction", async t => {
    const request = fixture(t);
    const result = await service.approveRequest("12", "5");
    assert.equal(result.membership.role, "owner");
    assert.equal(result.membership.user_id, "7");
    assert.equal(request.organization_id, "42");
    assert.equal(request.reviewed_by_user_id, "5");
    assert.equal(request.verification_status, "approved");
    await assert.rejects(service.approveRequest("12", "5"), {statusCode: 409});
    await assert.rejects(service.rejectRequest("12", "5", "reason"), {statusCode: 409});
    assert.equal(Organization.create.mock.callCount(), 1);
});

test("membership failure propagates out of managed transaction without approving request", async t => {
    const request = fixture(t);
    OrganizationMember.create.mock.mockImplementation(async () => { throw new Error("membership failed"); });
    await assert.rejects(service.approveRequest("12", "5"), /membership failed/);
    assert.equal(request.update.mock.callCount(), 0);
});

test("rejection records reason and creates no organization", async t => {
    const request = fixture(t);
    await service.rejectRequest("12", "5", "  Incorrect identifier  ");
    assert.equal(request.rejection_reason, "Incorrect identifier");
    assert.equal(request.verification_status, "rejected");
    assert.equal(Organization.create.mock.callCount(), 0);
    assert.equal(OrganizationMember.create.mock.callCount(), 0);
    await assert.rejects(service.approveRequest("12", "5"), {statusCode: 409});
});

test("inactive or unverified requester cannot be approved", async t => {
    fixture(t);
    User.findOne.mock.mockImplementation(async () => null);
    await assert.rejects(service.approveRequest("12", "5"), {statusCode: 409});
    assert.equal(Organization.create.mock.callCount(), 0);
});

test("a valid session cannot authenticate a disabled or deleted user", async t => {
    t.mock.method(Session, "findOne", async () => ({expires_at: new Date(Date.now() + 60000)}));
    t.mock.method(User, "findOne", async () => null);
    const token = generateAccessToken({sub: "999999999999999999", session_id: "999999999999999999"});
    const next = t.mock.fn();
    await assert.rejects(authenticate({get: () => `Bearer ${token}`}, {}, next), {code: "ACCOUNT_INACTIVE"});
    assert.equal(next.mock.callCount(), 0);
});

test("platform guard fails closed and checks current database permission", async t => {
    const next = t.mock.fn();
    await assert.rejects(requirePlatformAdmin({}, {}, next), {statusCode: 401});
    t.mock.method(User, "findOne", async options => {
        assert.equal(options.where.is_platform_admin, true);
        assert.equal(options.where.status, true);
        return null;
    });
    await assert.rejects(requirePlatformAdmin({auth: {sub: "1"}}, {}, next), {statusCode: 403});
    assert.equal(next.mock.callCount(), 0);
    User.findOne.mock.mockImplementation(async () => ({id: "1"}));
    await requirePlatformAdmin({auth: {sub: "1"}}, {}, next);
    assert.equal(next.mock.callCount(), 1);
});
