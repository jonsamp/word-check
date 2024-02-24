"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildFunction = void 0;
const assert_1 = __importDefault(require("assert"));
const BuildStep_js_1 = require("./BuildStep.cjs");
const customFunction_js_1 = require("./utils/customFunction.cjs");
class BuildFunction {
    constructor({ namespace, id, name, supportedRuntimePlatforms, inputProviders, outputProviders, command, fn, customFunctionModulePath, shell, }) {
        (0, assert_1.default)(command !== undefined || fn !== undefined || customFunctionModulePath !== undefined, 'Either command, fn or path must be defined.');
        (0, assert_1.default)(!(command !== undefined && fn !== undefined), 'Command and fn cannot be both set.');
        (0, assert_1.default)(!(command !== undefined && customFunctionModulePath !== undefined), 'Command and path cannot be both set.');
        (0, assert_1.default)(!(fn !== undefined && customFunctionModulePath !== undefined), 'Fn and path cannot be both set.');
        this.namespace = namespace;
        this.id = id;
        this.name = name;
        this.supportedRuntimePlatforms = supportedRuntimePlatforms;
        this.inputProviders = inputProviders;
        this.outputProviders = outputProviders;
        this.command = command;
        this.fn = fn;
        this.shell = shell;
        this.customFunctionModulePath = customFunctionModulePath;
    }
    getFullId() {
        return this.namespace === undefined ? this.id : `${this.namespace}/${this.id}`;
    }
    createBuildStepFromFunctionCall(ctx, { id, name, callInputs = {}, workingDirectory, shell, env, ifCondition, } = {}) {
        var _a, _b, _c;
        const buildStepId = BuildStep_js_1.BuildStep.getNewId(id);
        const buildStepName = name !== null && name !== void 0 ? name : this.name;
        const buildStepDisplayName = BuildStep_js_1.BuildStep.getDisplayName({
            id: buildStepId,
            command: this.command,
            name: buildStepName,
        });
        const inputs = (_a = this.inputProviders) === null || _a === void 0 ? void 0 : _a.map((inputProvider) => {
            const input = inputProvider(ctx, buildStepId);
            if (input.id in callInputs) {
                input.set(callInputs[input.id]);
            }
            return input;
        });
        const outputs = (_b = this.outputProviders) === null || _b === void 0 ? void 0 : _b.map((outputProvider) => outputProvider(ctx, buildStepId));
        return new BuildStep_js_1.BuildStep(ctx, {
            id: buildStepId,
            name: buildStepName,
            displayName: buildStepDisplayName,
            command: this.command,
            fn: (_c = this.fn) !== null && _c !== void 0 ? _c : (this.customFunctionModulePath
                ? (0, customFunction_js_1.createCustomFunctionCall)(this.customFunctionModulePath)
                : undefined),
            workingDirectory,
            inputs,
            outputs,
            shell,
            supportedRuntimePlatforms: this.supportedRuntimePlatforms,
            env,
            ifCondition,
        });
    }
}
exports.BuildFunction = BuildFunction;
//# sourceMappingURL=BuildFunction.js.map