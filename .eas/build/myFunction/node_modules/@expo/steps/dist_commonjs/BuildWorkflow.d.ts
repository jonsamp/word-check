import { BuildFunctionById } from './BuildFunction.js';
import { BuildStep } from './BuildStep.js';
import { BuildStepGlobalContext } from './BuildStepContext.js';
export declare class BuildWorkflow {
    private readonly ctx;
    readonly buildSteps: BuildStep[];
    readonly buildFunctions: BuildFunctionById;
    constructor(ctx: BuildStepGlobalContext, { buildSteps, buildFunctions }: {
        buildSteps: BuildStep[];
        buildFunctions: BuildFunctionById;
    });
    executeAsync(): Promise<void>;
}
