import createCliques from '../inferences/junctionTree/create-cliques'
import { createICliqueFactors } from '../inferences/junctionTree/create-initial-potentials'
import { getConnectedComponents } from '../utils/connected-components'
import { cptToFastPotential, FastPotential, indexToCombination } from './FastPotential'
import { EvidenceFunction, Formula, FormulaType, marginalize, mult, NodePotential, reference } from './Formula'
import { CliqueId, NodeId, ConnectedComponentId } from './common'
import { IClique, ICliqueFactors, IGraph, INetwork } from '..'
import { FastNode } from './FastNode'
import { FastClique } from './FastClique'
import { messageName } from './symbolic-propagation'
import { reduce } from 'ramda'

/** Given a formula and the corresponding fast potential, create a nice
 * human readable representation of the potential using a tabular format.
 */
export function showPotential (formula: Formula, potential: FastPotential): string {
  let result = `${formula.name}\n`
  const header: string = formula.domain.map(x => x.toString().padStart(4, ' ')).join('') + ' |       ' + '\n'
  result += header
  result += ''.padStart(header.length, '-') + '\n'
  const rows = potential.map((v, i) => {
    const ps: number[] = indexToCombination(i, formula.numberOfLevels)
    return `${ps.map(x => x.toString().padStart(4, ' ')).join('')} | ${v.toExponential(4)}`
  })

  result += rows.join('\n')
  return result
}

export type NetworkInfo = {
  cliques: IClique[];
  separators: number[][];
  junctionTree: IGraph;
  connectedComponents: number[][];
  factorMap: ICliqueFactors;
  cliqueMap: { [name: string]: number};
  nodeMap: { [name: string]: number};
  sepSetMap: { [name: string]: { [name: string]: number}};
  ccMap: { [name: string]: number};
  numberOfCliques: number;
  numberOfConnectedComponents: number;
  numberOfFormulas: number;
  numberOfNodes: number;
  numberOfMessages: number;
  cliqueOffset: number;
  messageOffset: number;
  roots: number[];
}

/** Given a INetwork, compute the information required to construct a
 * inference engine.
 */
export const getNetworkInfo = (network: INetwork): NetworkInfo => {
  const { cliques, sepSets, junctionTree } = createCliques(network)

  const factorMap = createICliqueFactors(cliques, network)
  const ccs = getConnectedComponents(junctionTree)

  const numberOfConnectedComponents = ccs.length
  const numberOfMessages = 2 * (cliques.length - numberOfConnectedComponents)
  const numberOfCliques = cliques.length
  const numberOfNodes = Object.keys(network).length
  const numberOfFormulas = numberOfNodes + numberOfCliques * 4 + numberOfMessages
  const cliqueOffset = numberOfNodes
  const messageOffset = cliqueOffset + numberOfCliques * 4

  const nodeMap: { [nodename: string]: number } = {}
  Object.keys(network).forEach((k, i) => { nodeMap[k] = i })
  const cliqueMap: { [cliquename: string]: number} = {}
  Object.values(cliques).forEach((k, i) => { cliqueMap[k.id] = i })

  const connectedComponents = ccs.map(cc => cc.map(cliqueName => cliqueMap[cliqueName]))
  const roots: CliqueId[] = connectedComponents.map(xs => xs[0])

  const ccMap: { [cliqueId: string]: ConnectedComponentId} = {}
  ccs.forEach((cc, i) => {
    cc.forEach(cliqueId => {
      ccMap[cliqueId.toString()] = i
    })
  })

  const sepSetMap: { [cliqueId: string]: { [cliqueId: string]: number }} = {}
  const separators: number[][] = []
  const separatorNameToId: { [name: string]: number} = {}
  sepSets.forEach(({ ca, cb, sharedNodes }) => {
    const a = ca
    const b = cb
    if (!sepSetMap[a.toString()]) sepSetMap[a.toString()] = {}
    if (!sepSetMap[b.toString()]) sepSetMap[b.toString()] = {}
    const members: NodeId[] = sharedNodes.map((nodename: string) => nodeMap[nodename])
    const name = members.sort().toString()
    if (!separatorNameToId[name]) {
      separatorNameToId[name] = separators.length
      separators.push(members)
    }
    const idx = separatorNameToId[name]
    sepSetMap[a.toString()][b.toString()] = idx
    sepSetMap[b.toString()][a.toString()] = idx
  })

  return {
    cliques,
    separators,
    junctionTree,
    connectedComponents,
    factorMap,
    cliqueMap,
    nodeMap,
    sepSetMap,
    ccMap,
    numberOfCliques,
    numberOfConnectedComponents,
    numberOfFormulas,
    numberOfNodes,
    numberOfMessages,
    cliqueOffset,
    messageOffset,
    roots,
  }
}

/** Given a collection of formulas, and a formula lookup function, return a
 * function that given a formula, either adds it to the collection of
 * formulas, or updates the stored value.   If the formula is a
 * reference, then dereference add upsert the given function, and if the
 * formula is a unit, then igore it.
 *
 * Returns the upserted formula.
 */
export const upsertFormula = (formulas: Formula[], formulaLookup: { [name: string]: number}) => (formula: Formula) => {
  switch (formula.kind) {
    case FormulaType.EVIDENCE_FUNCTION :
    case FormulaType.NODE_POTENTIAL :
    case FormulaType.PRODUCT :
    case FormulaType.MARGINAL : {
      const idx = formulaLookup[formula.name]
      if (idx == null) {
        // the formula has not already been cached.
        formula.id = formulas.length
        formulaLookup[formula.name] = formula.id
        formulas.push(formula)
        return formula
      } else {
        // the formula already is in the collection!  We can look up the previously cached value and
        // return it.
        return formulas[idx]
      }
    }
    case FormulaType.REFERENCE: {
      const deref = formulas[formula.id]
      if (deref) {
        return deref
      } else {
        // there is no function at the specified index.   This should never happen that
        // we have a null reference!
        throw new Error(`Null reference to formula ${formula.id}`)
      }
    }
    case FormulaType.UNIT:
      // NEVER ADD THE UNIT POTENTIAL!  It should already be optimized away from being included
      // directly in any result.
      return formula
  }
}

export function initializeNodes (network: INetwork, nodeMap: { [name: string]: NodeId }, upsert: (formula: Formula) => Formula, nodes: FastNode[]) {
  // Initialize the collection of nodes using the fast integer indexing.
// note that some of the fields (children, cliques, factorAssignedTo)
// cannot be populated on the initial pass.
  Object.values(network).forEach((node, i) => {
    const fastnode = {
      id: i,
      name: node.id,
      parents: node.parents.map(parentname => nodeMap[parentname]),
      children: [],
      referencedBy: [i],
      formula: i,
      posteriorMarginal: 0,
      evidenceFunction: 0,
      cliques: [],
      factorAssignedTo: 0,
      levels: node.states,
    }
    upsert(new NodePotential(fastnode, nodes))
    nodes[i] = fastnode
  })
}

// Populate the parents of each node.   This is done in a second pass
// to ensure that all the elements of the nodes collection have already
// been populated.
export function initializeNodeParents (nodes: FastNode[]) {
  nodes.forEach((node: FastNode) => {
    const { id, parents } = node
    parents.forEach(parentId => {
      nodes[parentId].children.push(id)
    })
  })
}

// Populate the evidence for each node.   This is done in a separate pass
// to ensure that all the elements of the nodes collection have already
// been populated.
export function initializeEvidence (nodes: FastNode[], upsert: (formula: Formula) => Formula) {
  nodes.forEach(node => {
    node.evidenceFunction = upsert(new EvidenceFunction(node)).id
  })
}

export function initializeCliques (info: NetworkInfo, upsert: (formula: Formula) => Formula, fastNodes: FastNode[], fastCliques: FastClique[], formulas: Formula[]) {
  const { cliques, junctionTree, cliqueMap, nodeMap, numberOfNodes, numberOfCliques, factorMap, ccMap, sepSetMap } = info
  cliques.forEach((clique, i) => {
    const neighs: string[] = junctionTree.getNodeEdges(clique.id)
    const neighbors: number[] = neighs.map(neighborname => cliqueMap[neighborname])
    const domain = clique.nodeIds.map(nodename => nodeMap[nodename]).sort()
    const factors = factorMap[clique.id].map(nodename => nodeMap[nodename])
    const prior = 2 * numberOfNodes + i
    const posterior = prior + numberOfCliques
    const fastclique = {
      id: i,
      name: clique.id,
      factors,
      domain,
      neighbors,
      prior,
      posterior,
      evidence: domain.map(i => i + numberOfNodes),
      messagesReceived: [],
      belongsTo: ccMap[i.toString()],
      separators: neighs.map(neigh => sepSetMap[clique.id][neigh]),
    }
    // append the clique to the fast cliques collection.
    fastCliques[i] = fastclique

    // For each node in this clique, append the reverse lookup information
    // in the corresponding fast node.
    domain.forEach((nodeId: NodeId) => { fastNodes[nodeId].cliques.push(i) })

    // Populate the prior potentials for the clique.  Make sure that the
    // reference count for the factor nodes is updated.
    fastclique.prior = upsert(mult(factors.map((nodeId: NodeId) => reference(nodeId, formulas)))).id
  })
}

export function initializePosteriorCliquePotentials (upsert: (formula: Formula) => Formula, fastNodes: FastNode[], fastCliques: FastClique[], messages: { [name: string]: Formula[]}, formulas: Formula[]) {
  fastCliques.forEach(clique => {
    const msgs: Formula[][] = clique.neighbors.map(x => messages[messageName(x, clique.id)] || [])
    clique.messagesReceived = msgs.map(xs => xs.filter(x => x.kind !== FormulaType.UNIT).map(x => x.id))
    clique.posterior = upsert(mult([
      reference(clique.prior, formulas),
      ...reduce((acc: Formula[], xs: Formula[]) => { acc.push(...xs); return acc }, [], msgs),
      ...clique.domain.map(id => formulas[fastNodes[id].evidenceFunction]),
    ],
    )).id
  })
}

export function initializeSeparatorPotentials (info: NetworkInfo, upsert: (formula: Formula) => Formula, fastCliques: FastClique[], formulas: Formula[]): number[] {
  const { separators } = info
  return separators.map((ns, i) => {
    const cliques = fastCliques.filter(c => c.separators.includes(i))
    if (cliques.length < 2) throw new Error(`Could not find a pair of cliques connected by separator ${ns}`)
    const [ca] = cliques
    const ia: number = ca.separators.findIndex(x => x === i)
    const fa: Formula = formulas[ca.posterior]
    const cb: FastClique = fastCliques.find(x => x.id === ca.neighbors[ia]) as FastClique
    const fb: Formula = formulas[cb.posterior]
    const cliquePotential = fa.size < fb.size ? fa : fb
    return upsert(marginalize(ns, cliquePotential, formulas)).id
  })
}

// create posterior separator potentials.   These will always be smaller than the clique potentials
// and may be useful in rapidly computing posterior marginals of nodes.

// Assign the posterior marignals for each node.  Since the posterior marginals have
// been made consistent by message passing, we can pick the smallest potential.
export function initializePosteriorNodePotentials (upsert: (formula: Formula) => Formula, fastNodes: FastNode[], fastCliques: FastClique[], formulas: Formula[], separatorPotentials: number[]) {
  fastNodes.forEach(fastNode => {
    let baseFormula: Formula = formulas[fastCliques[fastNode.cliques[0]].posterior]
    if (fastNode.cliques.length > 1) {
      // Find the smallest separator set that contains the node.   Then marginalize that
      // separator

      separatorPotentials.forEach((formId: number) => {
        const f: Formula = formulas[formId]
        if (f.domain.includes(fastNode.id)) {
          if (f.size < baseFormula.size) {
            baseFormula = f
          }
        }
      })
    }

    fastNode.posteriorMarginal = upsert(marginalize([fastNode.id], baseFormula, formulas)).id
  })
}

// Convert the cpts for each variable into a potential function
// and cache at the same index as the node.
export function initializePriorNodePotentials (network: INetwork, potentials: FastPotential[], fastNodes: FastNode[]) {
  fastNodes.forEach((node, i) => {
    potentials[i] = cptToFastPotential(node, network[node.name].cpt, fastNodes)
  })
}
