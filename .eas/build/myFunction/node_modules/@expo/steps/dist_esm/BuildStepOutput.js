import { BuildStepRuntimeError } from './errors.js';
export class BuildStepOutput {
    static createProvider(params) {
        return (ctx, stepDisplayName) => new BuildStepOutput(ctx, { ...params, stepDisplayName });
    }
    constructor(
    // @ts-expect-error ctx is not used in this class but let's keep it here for consistency
    ctx, { id, stepDisplayName, required }) {
        this.ctx = ctx;
        this.id = id;
        this.stepDisplayName = stepDisplayName;
        this.required = required;
    }
    get rawValue() {
        return this._value;
    }
    get value() {
        if (this.required && this._value === undefined) {
            throw new BuildStepRuntimeError(`Output parameter "${this.id}" for step "${this.stepDisplayName}" is required but it was not set.`);
        }
        return this._value;
    }
    set(value) {
        if (this.required && value === undefined) {
            throw new BuildStepRuntimeError(`Output parameter "${this.id}" for step "${this.stepDisplayName}" is required.`);
        }
        this._value = value;
        return this;
    }
    serialize() {
        return {
            id: this.id,
            stepDisplayName: this.stepDisplayName,
            required: this.required,
            value: this._value,
        };
    }
    static deserialize(serialized) {
        const deserialized = new BuildStepOutput(undefined, {
            id: serialized.id,
            stepDisplayName: serialized.stepDisplayName,
            required: serialized.required,
        });
        deserialized._value = serialized.value;
        return deserialized;
    }
}
export function makeBuildStepOutputByIdMap(outputs) {
    if (outputs === undefined) {
        return {};
    }
    return outputs.reduce((acc, output) => {
        acc[output.id] = output;
        return acc;
    }, {});
}
//# sourceMappingURL=BuildStepOutput.js.map