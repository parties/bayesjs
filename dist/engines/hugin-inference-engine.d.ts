import { IInferenceEngine, ISepSet, INetworkResult, IInferAllOptions, ICptWithParents, ICptWithoutParents, INetwork, ICombinations, ICliquePotentials, IClique, IGraph } from '../types';
export declare class HuginInferenceEngine implements IInferenceEngine {
    private _network;
    private _connectedComponents;
    private _cliques;
    private _sepSets;
    private _junctionTree;
    private _potentials;
    private _marginals;
    private _evidence;
    constructor(network: INetwork);
    private resetCache;
    hasVariable: (name: string) => boolean;
    getVariables: () => string[];
    hasLevel: (name: string, level: string) => boolean;
    getLevels: (name: string) => string[];
    hasParent: (name: string, parent: string) => boolean;
    getParents: (name: string) => string[];
    getDistribution: (name: string) => ICptWithoutParents | ICptWithParents;
    setDistribution: (name: string, cpt: ICptWithParents | ICptWithoutParents) => void;
    private getCliquesPotentials;
    hasEvidenceFor: (name: string) => boolean;
    setEvidence: (evidence: {
        [name: string]: string;
    }) => void;
    updateEvidence: (evidence: {
        [name: string]: string;
    }) => void;
    removeEvidence: (name: string) => void;
    removeAllEvidence: () => void;
    infer: (event: ICombinations) => number;
    inferAll: (options?: IInferAllOptions | undefined) => INetworkResult;
    toJSON: () => {
        _class: string;
        _cliques: IClique[];
        _connectedComponents: string[][];
        _evidence: ICombinations;
        _junctionTree: IGraph;
        _marginals: INetworkResult;
        _network: INetwork;
        _potentials: ICliquePotentials;
        _sepSets: ISepSet[];
    };
}
