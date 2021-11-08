import { CliqueId, NodeId, FormulaId, ConnectedComponentId } from './common';
export declare type FastClique = {
    id: CliqueId;
    name: string;
    factors: NodeId[];
    domain: NodeId[];
    neighbors: CliqueId[];
    messagesReceived: FormulaId[][];
    prior: FormulaId;
    posterior: FormulaId;
    evidence: FormulaId[];
    belongsTo: ConnectedComponentId;
    separators: NodeId[];
};
