import { ICptWithoutParents, ICptWithParents } from '..';
import { FastNode } from './FastNode';
import { NodeId } from './common';
export declare type FastPotential = number[];
export declare const combinationToIndex: (combination: number[], numberOfLevels: number[]) => number;
export declare const indexToCombination: (index: number, numberOfLevels: number[]) => number[];
export declare const cptToFastPotential: (node: FastNode, cpt: ICptWithParents | ICptWithoutParents, nodes: FastNode[]) => number[];
export declare const fastPotentialToCPT: (nodeId: NodeId, nodes: FastNode[], potential: FastPotential) => ICptWithoutParents | ICptWithParents;
