import { BuildFunctionCallInputs } from './BuildFunction.js';
import { BuildStep } from './BuildStep.js';
import { BuildStepGlobalContext } from './BuildStepContext.js';
import { BuildStepInputById, BuildStepInputProvider } from './BuildStepInput.js';
export type BuildFunctionGroupById = Record<string, BuildFunctionGroup | undefined>;
export declare class BuildFunctionGroup {
    readonly namespace: string;
    readonly id: string;
    readonly inputProviders?: BuildStepInputProvider[];
    readonly createBuildStepsFromFunctionGroupCall: (globalCtx: BuildStepGlobalContext, options?: {
        callInputs?: BuildFunctionCallInputs;
    }) => BuildStep[];
    constructor({ namespace, id, inputProviders, createBuildStepsFromFunctionGroupCall, }: {
        namespace: string;
        id: string;
        inputProviders?: BuildStepInputProvider[];
        createBuildStepsFromFunctionGroupCall: (globalCtx: BuildStepGlobalContext, { inputs, }: {
            inputs: BuildStepInputById;
        }) => BuildStep[];
    });
    getFullId(): string;
}
export declare function createBuildFunctionGroupByIdMapping(buildFunctionGroups: BuildFunctionGroup[]): BuildFunctionGroupById;
