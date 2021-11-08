import { NodeId, FormulaId } from './common';
import { FastNode } from './FastNode';
export declare enum FormulaType {
    MARGINAL = 0,
    PRODUCT = 1,
    NODE_POTENTIAL = 2,
    EVIDENCE_FUNCTION = 3,
    UNIT = 4,
    REFERENCE = 5
}
export declare type Formula = Marginal | Product | NodePotential | EvidenceFunction | Unit | Reference;
export declare class Unit {
    id: number;
    kind: FormulaType;
    domain: number[];
    numberOfLevels: number[];
    size: number;
    name: string;
    refrerencedBy: number[];
    constructor();
}
export declare class Reference {
    id: number;
    kind: FormulaType;
    formulaId: FormulaId;
    name: string;
    domain: NodeId[];
    numberOfLevels: number[];
    size: number;
    refrerencedBy: number[];
    constructor(id: FormulaId, formulas: Formula[]);
}
export declare const reference: (formulaId: FormulaId, formulas: Formula[]) => Formula;
export declare class Marginal {
    id: number;
    kind: FormulaType;
    separator: NodeId[];
    potential: FormulaId;
    domain: NodeId[];
    marginalized: NodeId[];
    name: string;
    numberOfLevels: number[];
    size: number;
    refrerencedBy: number[];
    constructor(separator: NodeId[], formula: Formula);
}
export declare const marginalize: (sepSet: NodeId[], potential: Formula, formulas: Formula[]) => Formula;
export declare class Product {
    id: number;
    kind: FormulaType;
    domain: number[];
    name: string;
    factorIds: FormulaId[];
    numberOfLevels: number[];
    size: number;
    refrerencedBy: number[];
    constructor(factors: Formula[]);
}
export declare const mult: (formulas: Formula[]) => Formula;
export declare class NodePotential {
    id: number;
    kind: FormulaType;
    nodeId: number;
    domain: number[];
    name: string;
    numberOfLevels: number[];
    size: number;
    refrerencedBy: number[];
    constructor(node: FastNode, nodes: FastNode[]);
}
export declare class EvidenceFunction {
    id: number;
    kind: FormulaType;
    nodeId: number;
    level: number | null;
    name: string;
    domain: number[];
    numberOfLevels: number[];
    size: number;
    refrerencedBy: number[];
    constructor(node: FastNode);
}
export declare function updateReferences(formulas: Formula[]): void;
