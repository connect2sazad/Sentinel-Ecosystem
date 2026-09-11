export const singleFlight = action => {
    let pending = null;
    return () => {
        if (!pending) {
            pending = Promise.resolve().then(action).finally(() => { pending = null; });
        }
        return pending;
    };
};
