import { enumeration, junctionTree, variableElimination } from './inferences';
export declare const inferences: {
    enumeration: typeof enumeration;
    junctionTree: typeof junctionTree;
    variableElimination: typeof variableElimination;
};
export * from './builder';
export declare const infer: import("./types").IInfer;
export * from './types';
export * from './utils/inferAll';
export { LazyPropagationEngine as InferenceEngine } from './engines';
