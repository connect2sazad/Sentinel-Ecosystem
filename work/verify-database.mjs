import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import db from '../sentinel-auth/backend/src/config/database.js';
import { User, Organization, OrganizationRequest, OrganizationMember } from '../sentinel-auth/backend/src/models/index.js';
import service from '../sentinel-auth/backend/src/services/organization.service.js';

db.options.logging = false;
const transaction = db.transaction.bind(db);
const outer = await transaction();
const marker = `Codex verification ${randomUUID()}`;
try {
    // All fixtures and service writes remain inside a transaction rolled back below.
    db.transaction = callback => transaction({transaction: outer}, callback);
    const user = await User.create({name: marker.slice(0, 90), email: `${randomUUID()}@example.invalid`,
        password: 'unusable-test-password', email_verified_at: new Date()}, {transaction: outer});
    const request = await service.requestOrganization(String(user.id), {name: marker});
    await assert.rejects(service.requestOrganization(String(user.id), {name: `${marker} duplicate`}), {statusCode: 409});
    const approved = await service.approveRequest(String(request.id), user.id);
    assert.equal(approved.membership.role, 'owner');
    assert.equal(String(approved.request.organization_id), String(approved.organization.id));
    await assert.rejects(service.approveRequest(String(request.id), user.id), {statusCode: 409});
    await assert.rejects(service.rejectRequest(String(request.id), user.id, 'Too late'), {statusCode: 409});
    console.log('PASS: submission, duplicate submission, approval, owner membership, repeat review conflict');

    const rejectedRequest = await service.requestOrganization(String(user.id), {name: `${marker} rejection`});
    const rejected = await service.rejectRequest(String(rejectedRequest.id), user.id, 'Verification test');
    assert.equal(rejected.verification_status, 'rejected');
    assert.equal(rejected.organization_id, null);
    console.log('PASS: rejection and stored reason');

    const failedName = `${marker} rollback`;
    const failedRequest = await service.requestOrganization(String(user.id), {name: failedName});
    const create = OrganizationMember.create;
    try {
        OrganizationMember.create = async () => { throw new Error('Injected membership failure'); };
        await assert.rejects(service.approveRequest(String(failedRequest.id), user.id), /Injected membership failure/);
    } finally { OrganizationMember.create = create; }
    assert.equal(await Organization.count({where: {name: failedName}, transaction: outer}), 0);
    const unchanged = await OrganizationRequest.findByPk(failedRequest.id, {transaction: outer});
    assert.equal(unchanged.verification_status, 'pending');
    console.log('PASS: actual database rollback removes organization after membership failure');
} finally {
    db.transaction = transaction;
    await outer.rollback();
    console.log('Verification fixtures rolled back.');
    await db.close();
}
