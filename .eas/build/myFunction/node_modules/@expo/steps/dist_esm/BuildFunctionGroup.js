import { makeBuildStepInputByIdMap, } from './BuildStepInput.js';
import { BuildConfigError } from './errors.js';
export class BuildFunctionGroup {
    constructor({ namespace, id, inputProviders, createBuildStepsFromFunctionGroupCall, }) {
        this.namespace = namespace;
        this.id = id;
        this.inputProviders = inputProviders;
        this.createBuildStepsFromFunctionGroupCall = (ctx, { callInputs = {} } = {}) => {
            var _a;
            const inputs = (_a = this.inputProviders) === null || _a === void 0 ? void 0 : _a.map((inputProvider) => {
                const input = inputProvider(ctx, id);
                if (input.id in callInputs) {
                    input.set(callInputs[input.id]);
                }
                return input;
            });
            return createBuildStepsFromFunctionGroupCall(ctx, {
                inputs: makeBuildStepInputByIdMap(inputs),
            });
        };
    }
    getFullId() {
        return this.namespace === undefined ? this.id : `${this.namespace}/${this.id}`;
    }
}
export function createBuildFunctionGroupByIdMapping(buildFunctionGroups) {
    const buildFunctionGroupById = {};
    for (const buildFunctionGroup of buildFunctionGroups) {
        if (buildFunctionGroupById[buildFunctionGroup.getFullId()] !== undefined) {
            throw new BuildConfigError(`Build function group with id ${buildFunctionGroup.getFullId()} is already defined.`);
        }
        buildFunctionGroupById[buildFunctionGroup.getFullId()] = buildFunctionGroup;
    }
    return buildFunctionGroupById;
}
//# sourceMappingURL=BuildFunctionGroup.js.map