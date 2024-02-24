declare abstract class UserError extends Error {
    readonly message: string;
    readonly cause?: Error;
    readonly metadata: object;
    constructor(message: string, extra?: {
        metadata?: object;
        cause?: Error;
    });
}
export declare class BuildConfigError extends UserError {
}
export { YAMLParseError as BuildConfigYAMLError } from 'yaml';
export declare class BuildInternalError extends Error {
}
export declare class BuildStepRuntimeError extends UserError {
}
export declare class BuildWorkflowError extends UserError {
    readonly message: string;
    readonly errors: BuildConfigError[];
    constructor(message: string, errors: BuildConfigError[], extra?: {
        metadata?: object;
        cause?: Error;
    });
}
