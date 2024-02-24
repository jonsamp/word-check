/// <reference types="node" />
export declare const createContext: () => {
    readonly filename: string;
    readonly dirname: string;
    readonly require: NodeRequire;
};
