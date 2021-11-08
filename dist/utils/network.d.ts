import { INetwork, INode } from '../types';
export declare const createNetwork: (...nodes: INode[]) => INetwork;
export declare const getNodeParents: (node: INode) => string[];
export declare const getNodeId: (node: INode) => string;
export declare const getNodeStates: (node: INode) => string[];
export declare const hasNodeParents: (node: INode) => boolean;
export declare const getNodeParentsAndId: (node: INode) => string[];
export declare const hasNotNodeParents: (node: INode) => boolean;
export declare const getNodesFromNetwork: (network: INetwork) => INode[];
export declare const filterNodeWithParents: (nodes: INode[]) => INode[];
export declare const getNodeIdsWithoutParents: (network: INetwork) => string[];
