import { NodeId, FormulaId, CliqueId } from './common';
export declare type FastNode = {
    id: NodeId;
    name: string;
    parents: NodeId[];
    children: NodeId[];
    formula: FormulaId;
    evidenceFunction: FormulaId;
    posteriorMarginal: FormulaId;
    cliques: CliqueId[];
    levels: string[];
};
