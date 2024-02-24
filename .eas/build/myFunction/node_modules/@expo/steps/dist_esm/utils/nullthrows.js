export function nullthrows(value, message) {
    if (value != null) {
        return value;
    }
    throw new TypeError(message !== null && message !== void 0 ? message : `Expected value not to be null or undefined but got ${value}`);
}
//# sourceMappingURL=nullthrows.js.map