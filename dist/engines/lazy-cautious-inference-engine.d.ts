import { INetwork, INetworkResult, IInferenceEngine, ICptWithParents, ICptWithoutParents, IInferAllOptions } from '../types';
import { FastPotential } from './FastPotential';
import { FastClique } from './FastClique';
import { FastNode } from './FastNode';
import { Formula } from './Formula';
/** This inference engine uses a modified version of the lazy cautious message
 * propigation strategy described in:
 * "Lazy Propagation: A Junction Tree Inference Algorithm based on Lazy evaluation"
 * by Madsen and Jensen.
 *
 * This implementation extends the algorithm described by the authors by using
 * a symbolic message passing architecture.   Message passing populates a
 * collection of formulas for each message and posterior marginals using the
 * AST that is made explicit in the Formula type.  The syntax of the ASTs has
 * been chosen so that it can be performed once, and need not be updated with
 * changes in either hard or soft evidence.
 *
 * The potentials are evaluated upon demand whenever the infer function is
 * called.   The inference results and the results of any intermediate
 * computations are stored in the potentials cache to facilitate subsequent
 * inferences.   This separation of concerns between message passing and
 * evaluation allows not only fast retraction of hard evidence, but also
 * replacement of potential functions for individual nodes of the Bayes
 * network without invalidating the entire cache.
 *
 */
export declare class LazyPropagationEngine implements IInferenceEngine {
    private _cliques;
    private _nodes;
    private _potentials;
    private _formulas;
    private _connectedComponents;
    private _separators;
    private _separatorPotentials;
    /** This function recursively clears the cached potentials starting from the given
     * formula id.   It terminates the recursion down any branch when it encounters
     * a cached value that is null, because this implies that all cached values that
     * are depends of that potential are also null.
     */
    private clearCachedValues;
    constructor(network: INetwork);
    hasVariable: (name: string) => boolean;
    getVariables: () => string[];
    getParents: (name: string) => string[];
    hasParent: (name: string, parent: string) => boolean;
    getLevels: (name: string) => string[];
    hasLevel: (name: string, level: string) => boolean;
    getDistribution: (name: string) => ICptWithoutParents | ICptWithParents;
    setDistribution: (name: string, distribution: ICptWithoutParents | ICptWithParents) => void;
    hasEvidenceFor: (name: string) => boolean;
    getEvidence: (name: string) => string | false | null;
    updateEvidence: (evidence: {
        [name: string]: string;
    }) => void;
    setEvidence: (evidence: {
        [name: string]: string;
    }) => void;
    /** Remove any hard evidence for the given variable.   If the
     * variable has no hard evidence, then the cache will remain
     * unchanged.   Otherwise, all cached values that depend either directly
     * or indirectly on the evidence will be cleared.  NOTE:
     * This could be further improved by using the d-connecteness
     * properties of the nodes;  this is left for future work.
     */
    removeEvidence: (name: string) => void;
    removeAllEvidence: () => void;
    /** Given a single node,  infer the probability of an event from the
     * posterior marginal distribution for that node.
     */
    private inferFromMarginal;
    /** Given a collection of nodes and levels representing an event, construct the
     * joint probability distribution distribution on the given nodes by creating a
     * new potential function that "adds the fill in edges" between the cliques
     * that contain the nodes.   This is expensive, and should be cached to avoid
     * expensive recomputation.  This is left as future work.
     */
    private inferFromJointDistribution;
    /** Given a collection of nodes and levels representing an event, and a clique
     * which contains all the given nodes, compute the joint probability of the event
     * by totalizing all the corresponding rows in the cliques posterior marginal
     * potential function.
     */
    private inferFromClique;
    infer: (event: {
        [name: string]: string;
    }) => number;
    inferAll: (options?: IInferAllOptions | undefined) => INetworkResult;
    toJSON: () => {
        _class: string;
        _cliques: FastClique[];
        _nodes: FastNode[];
        _potentials: (FastPotential | null)[];
        _formulas: Formula[];
        _connectedComponents: number[][];
        _separators: number[][];
        _separatorPotentials: number[];
    };
}
