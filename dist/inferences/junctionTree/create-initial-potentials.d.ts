import { IClique, ICliqueFactors, ICliquePotentials, ICombinations, INetwork } from '../../types';
/** Return an object that associates each clique with the factors which it contains.
 * Each factor can be assigned to exactly one clique, that that clique must include
 * all of it's parents.   Note that for some network topologies, this may result in
 * a choice for which clique to assign the factor
 *
 * Example, the network having the graph below:
 *
 *     A
 *   / | \
 *  V  V  V
 * B-->C<--D
 *
 * has two cliques: {A,B,C} and {A,C,D}.   The factors A and C can be assigned to either
 * clique, but not both.  To make inference easier, whenever possible we assign a factor to a clique
 * with the fewer number of nodes.
 * */
export declare const createICliqueFactors: (cliques: IClique[], network: INetwork) => ICliqueFactors;
declare const _default: (cliques: IClique[], network: INetwork, given: ICombinations) => ICliquePotentials;
export default _default;
