import { FastPotential } from './FastPotential';
import { Formula } from './Formula';
import { NodeId } from './common';
import { IClique, ICliqueFactors, IGraph, INetwork } from '..';
import { FastNode } from './FastNode';
import { FastClique } from './FastClique';
/** Given a formula and the corresponding fast potential, create a nice
 * human readable representation of the potential using a tabular format.
 */
export declare function showPotential(formula: Formula, potential: FastPotential): string;
export declare type NetworkInfo = {
    cliques: IClique[];
    separators: number[][];
    junctionTree: IGraph;
    connectedComponents: number[][];
    factorMap: ICliqueFactors;
    cliqueMap: {
        [name: string]: number;
    };
    nodeMap: {
        [name: string]: number;
    };
    sepSetMap: {
        [name: string]: {
            [name: string]: number;
        };
    };
    ccMap: {
        [name: string]: number;
    };
    numberOfCliques: number;
    numberOfConnectedComponents: number;
    numberOfFormulas: number;
    numberOfNodes: number;
    numberOfMessages: number;
    cliqueOffset: number;
    messageOffset: number;
    roots: number[];
};
/** Given a INetwork, compute the information required to construct a
 * inference engine.
 */
export declare const getNetworkInfo: (network: INetwork) => NetworkInfo;
/** Given a collection of formulas, and a formula lookup function, return a
 * function that given a formula, either adds it to the collection of
 * formulas, or updates the stored value.   If the formula is a
 * reference, then dereference add upsert the given function, and if the
 * formula is a unit, then igore it.
 *
 * Returns the upserted formula.
 */
export declare const upsertFormula: (formulas: Formula[], formulaLookup: {
    [name: string]: number;
}) => (formula: Formula) => Formula;
export declare function initializeNodes(network: INetwork, nodeMap: {
    [name: string]: NodeId;
}, upsert: (formula: Formula) => Formula, nodes: FastNode[]): void;
export declare function initializeNodeParents(nodes: FastNode[]): void;
export declare function initializeEvidence(nodes: FastNode[], upsert: (formula: Formula) => Formula): void;
export declare function initializeCliques(info: NetworkInfo, upsert: (formula: Formula) => Formula, fastNodes: FastNode[], fastCliques: FastClique[], formulas: Formula[]): void;
export declare function initializePosteriorCliquePotentials(upsert: (formula: Formula) => Formula, fastNodes: FastNode[], fastCliques: FastClique[], messages: {
    [name: string]: Formula[];
}, formulas: Formula[]): void;
export declare function initializeSeparatorPotentials(info: NetworkInfo, upsert: (formula: Formula) => Formula, fastCliques: FastClique[], formulas: Formula[]): number[];
export declare function initializePosteriorNodePotentials(upsert: (formula: Formula) => Formula, fastNodes: FastNode[], fastCliques: FastClique[], formulas: Formula[], separatorPotentials: number[]): void;
export declare function initializePriorNodePotentials(network: INetwork, potentials: FastPotential[], fastNodes: FastNode[]): void;
