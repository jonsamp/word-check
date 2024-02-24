"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildWorkflowError = exports.BuildStepRuntimeError = exports.BuildInternalError = exports.BuildConfigYAMLError = exports.BuildConfigError = void 0;
class UserError extends Error {
    constructor(message, extra) {
        var _a;
        super(message);
        this.message = message;
        this.metadata = (_a = extra === null || extra === void 0 ? void 0 : extra.cause) !== null && _a !== void 0 ? _a : {};
        this.cause = extra === null || extra === void 0 ? void 0 : extra.cause;
    }
}
class BuildConfigError extends UserError {
}
exports.BuildConfigError = BuildConfigError;
var yaml_1 = require("yaml");
Object.defineProperty(exports, "BuildConfigYAMLError", { enumerable: true, get: function () { return yaml_1.YAMLParseError; } });
class BuildInternalError extends Error {
}
exports.BuildInternalError = BuildInternalError;
class BuildStepRuntimeError extends UserError {
}
exports.BuildStepRuntimeError = BuildStepRuntimeError;
class BuildWorkflowError extends UserError {
    constructor(message, errors, extra) {
        super(message, extra);
        this.message = message;
        this.errors = errors;
    }
}
exports.BuildWorkflowError = BuildWorkflowError;
//# sourceMappingURL=errors.js.map