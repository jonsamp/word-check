import { BuildStepGlobalContext } from './BuildStepContext.js';
export type BuildStepOutputById = Record<string, BuildStepOutput>;
export type BuildStepOutputProvider = (ctx: BuildStepGlobalContext, stepDisplayName: string) => BuildStepOutput;
interface BuildStepOutputProviderParams<R extends boolean = boolean> {
    id: string;
    required: R;
}
interface BuildStepOutputParams<R extends boolean = boolean> extends BuildStepOutputProviderParams<R> {
    stepDisplayName: string;
}
type BuildStepOutputValueType<R extends boolean = boolean> = R extends true ? string : string | undefined;
export interface SerializedBuildStepOutput<R extends boolean = boolean> {
    id: string;
    stepDisplayName: string;
    required: R;
    value?: string;
}
export declare class BuildStepOutput<R extends boolean = boolean> {
    private readonly ctx;
    readonly id: string;
    readonly stepDisplayName: string;
    readonly required: R;
    private _value?;
    static createProvider(params: BuildStepOutputProviderParams): BuildStepOutputProvider;
    constructor(ctx: BuildStepGlobalContext | undefined, { id, stepDisplayName, required }: BuildStepOutputParams<R>);
    get rawValue(): string | undefined;
    get value(): BuildStepOutputValueType<R>;
    set(value: BuildStepOutputValueType<R>): BuildStepOutput;
    serialize(): SerializedBuildStepOutput;
    static deserialize(serialized: SerializedBuildStepOutput): BuildStepOutput;
}
export declare function makeBuildStepOutputByIdMap(outputs?: BuildStepOutput[]): BuildStepOutputById;
export {};
