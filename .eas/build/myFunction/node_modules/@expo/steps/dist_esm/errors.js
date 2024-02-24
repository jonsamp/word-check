class UserError extends Error {
    constructor(message, extra) {
        var _a;
        super(message);
        this.message = message;
        this.metadata = (_a = extra === null || extra === void 0 ? void 0 : extra.cause) !== null && _a !== void 0 ? _a : {};
        this.cause = extra === null || extra === void 0 ? void 0 : extra.cause;
    }
}
export class BuildConfigError extends UserError {
}
export { YAMLParseError as BuildConfigYAMLError } from 'yaml';
export class BuildInternalError extends Error {
}
export class BuildStepRuntimeError extends UserError {
}
export class BuildWorkflowError extends UserError {
    constructor(message, errors, extra) {
        super(message, extra);
        this.message = message;
        this.errors = errors;
    }
}
//# sourceMappingURL=errors.js.map