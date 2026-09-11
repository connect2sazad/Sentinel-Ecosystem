import test from "node:test";
import assert from "node:assert/strict";
import { singleFlight } from "../src/api/single-flight.js";

test("simultaneous session restores make one refresh request", async () => {
    let calls = 0;
    let resolve;
    const refresh = singleFlight(() => {
        calls++;
        return new Promise(done => { resolve = done; });
    });
    const first = refresh();
    const second = refresh();
    await Promise.resolve();
    assert.equal(calls, 1);
    assert.equal(first, second);
    resolve("new-token");
    assert.deepEqual(await Promise.all([first, second]), ["new-token", "new-token"]);
    const third = refresh();
    await Promise.resolve();
    assert.equal(calls, 2);
    resolve("next-token");
    await third;
});

test("failed refresh can be retried", async () => {
    let calls = 0;
    const refresh = singleFlight(async () => {
        if (++calls === 1) throw new Error("offline");
        return "token";
    });
    await assert.rejects(refresh(), /offline/);
    assert.equal(await refresh(), "token");
});
