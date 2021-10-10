import { NodeId, FormulaId } from './common'
import { FastNode } from './FastNode'
import { reduce, product } from 'ramda'

export enum FormulaType {
  MARGINAL,
  PRODUCT,
  NODE_POTENTIAL,
  EVIDENCE_FUNCTION,
  UNIT,
  REFERENCE
}

export type Formula = Marginal | Product | NodePotential | EvidenceFunction | Unit | Reference

export class Unit {
  id = -1;
  kind = FormulaType.UNIT;
  domain: number[];
  numberOfLevels: number[];
  size: number;
  name: string;
  refrerencedBy: number[] = []

  constructor () {
    this.domain = []
    this.name = '1'
    this.size = 0
    this.numberOfLevels = []
  };
}

export class Reference {
  id: number;
  kind: FormulaType = FormulaType.REFERENCE;
  formulaId: FormulaId;
  name: string;
  domain: NodeId[];
  numberOfLevels: number[];
  size: number;
  refrerencedBy: number[] = []

  constructor (id: FormulaId, formulas: Formula[]) {
    this.id = id
    this.domain = formulas[id].domain
    this.formulaId = id
    this.name = `ref(${id})`
    this.numberOfLevels = formulas[id].numberOfLevels
    this.size = formulas[id].size
  }
}

export const reference = (formulaId: FormulaId, formulas: Formula[]) => {
  const deref: Formula = formulas[formulaId]
  switch (deref.kind) {
    // case FormulaType.PRIOR_POTENTIAL
    case FormulaType.REFERENCE:
    case FormulaType.UNIT: return deref
    default: return new Reference(formulaId, formulas)
  }
}

export class Marginal {
  id = -1;
  kind: FormulaType = FormulaType.MARGINAL
  separator: NodeId[];
  potential: FormulaId;
  domain: NodeId[];
  marginalized: NodeId[];
  name: string;
  numberOfLevels: number[];
  size: number;
  refrerencedBy: number[] = []

  constructor (separator: NodeId[], formula: Formula) {
    this.separator = separator
    this.potential = formula.id
    const d: number[] = formula.domain
    this.domain = separator.filter(x => d.includes(x))
    this.marginalized = d.filter(x => !separator.includes(x))
    this.name = `Σ({${this.marginalized.map(x => x.toString()).join(',')}},${formula.name})`
    this.numberOfLevels = this.domain.map(y => formula.numberOfLevels[formula.domain.findIndex(x => x === y)])
    this.size = product(this.numberOfLevels)
  }
}

export const marginalize: (sepSet: NodeId[], potential: Formula, formulas: Formula[]) => Formula = (sepSet, potential, formulas) => {
  const dom = potential.domain
  const d: NodeId[] = sepSet.filter(x => dom.includes(x))
  if (d.length === 0) return new Unit()
  if (d.length === dom.length) return potential

  switch (potential.kind) {
    case FormulaType.MARGINAL: {
      return new Marginal(d, formulas[(potential as Marginal).potential])
    }
    case FormulaType.UNIT: return potential
    default: return new Marginal(d, potential)
  }
}

export class Product {
  id = -1;
  kind: FormulaType = FormulaType.PRODUCT
  domain: number[];
  name: string;
  factorIds: FormulaId[];
  numberOfLevels: number[];
  size: number;
  refrerencedBy: number[] = []

  constructor (factors: Formula[]) {
    this.factorIds = factors.map(x => x.id)
    this.name = `𝚷(${factors.map(x => x.name).join(',')})`
    this.domain = [...new Set(reduce((acc: NodeId[], x: Formula) => ([...acc, ...x.domain])
      , [], factors))]
    this.numberOfLevels = this.domain.map(x => {
      const maybefactor = factors.find(factor => factor.domain.includes(x))
      if (!maybefactor) throw new Error(`Domain of product ${this.name} contains nodes which are not in its factors`)
      const factor = maybefactor as Formula
      return factor.numberOfLevels[factor.domain.findIndex(y => y === x)]
    })
    this.size = product(this.numberOfLevels)
  }
}

export const mult = (formulas: Formula[]): Formula => {
  const fs = formulas.filter(x => x.kind !== FormulaType.UNIT)
  if (fs.length === 0) return new Unit()
  if (fs.length === 1) return formulas[0]
  return new Product(fs)
}

export class NodePotential {
  id: number;
  kind: FormulaType = FormulaType.NODE_POTENTIAL;
  nodeId: number;
  domain: number[];
  name: string;
  numberOfLevels: number[];
  size: number;
  refrerencedBy: number[] = []

  constructor (node: FastNode, nodes: FastNode[]) {
    this.id = node.id
    this.nodeId = node.id
    this.domain = [node.id, ...node.parents]
    this.name = `Φ(${node.id})`
    this.numberOfLevels = [node.levels.length, ...node.parents.map(x => nodes[x].levels.length)]
    this.size = product(this.numberOfLevels)
  }
}

export class EvidenceFunction {
  id = -1;
  kind = FormulaType.EVIDENCE_FUNCTION;
  nodeId: number;
  level: number | null ;
  name: string;
  domain: number[];
  numberOfLevels: number[];
  size: number;
  refrerencedBy: number[] = []

  constructor (node: FastNode, formulas: Formula[]) {
    this.nodeId = node.id
    this.level = null
    this.domain = [node.id, ...node.parents]
    this.name = `ϵ(Φ(${node.id}))`
    this.numberOfLevels = formulas[node.id].numberOfLevels
    this.size = formulas[node.id].size
  }
}

export function updateReferences (formulas: Formula[]): void {
  formulas.forEach(formula => {
    switch (formula.kind) {
      case FormulaType.EVIDENCE_FUNCTION: {
        const f = formula as EvidenceFunction
        formulas[f.nodeId].refrerencedBy.push(f.id)
        break
      }
      case FormulaType.MARGINAL:
      {
        const f = formula as Marginal
        formulas[f.potential].refrerencedBy.push(f.id)
        break
      }

      case FormulaType.PRODUCT: {
        const f = formula as Product
        f.factorIds.forEach(factorId => formulas[factorId].refrerencedBy.push(f.id))
        break
      }
      case FormulaType.REFERENCE: {
        const f = formula as Reference
        formulas[f.formulaId].refrerencedBy.push(f.id)
        break
      }
      case FormulaType.NODE_POTENTIAL:
      case FormulaType.UNIT:
    }
  })
}
