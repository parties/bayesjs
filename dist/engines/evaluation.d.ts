import { Formula } from './Formula';
import { FastNode } from './FastNode';
import { FastPotential } from './FastPotential';
import { FormulaId } from './common';
declare type MaybeFastPotential = FastPotential | null;
/**
 * Recursively evaluate a formula for a potential.
 * @param marginalFormula - the symbolic representation of the marginal being evaulated
 * @param nodes - The collection of nodes in the inference engine.  This is used to
 *   locate locate nodes in the domain of the marginal and comprehend their properties
 * @param formulas - A list containing the symbolic representation of the potential functions
 *   of each clique, potential and term that occurs in the Bayes network.   This is used for
 *   evaluating the potential that is being marginalized
 * @param potentials - The collection of potentials corresponding to possibly cached results
 *   of evaluting the given list of formulas.  The list of potentials and list of formulas
 *   share the same ordering scheme such that the first potential corresponds to the cached
 *   result of evaluating the first potential, and so on.
 * NOTE: If this function computes a new value for the given formula or any of its terms,
 *   it will mutate the cache of potentials to update the cached values.
 */
export declare const evaluate: (formulaId: FormulaId, nodes: FastNode[], formulas: Formula[], potentials: MaybeFastPotential[]) => FastPotential;
export {};
