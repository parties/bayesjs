import { CliqueId } from './common';
import { FastClique } from './FastClique';
import { Formula } from './Formula';
declare type Messages = {
    [key: string]: Formula[];
};
export declare const messageName: (sourceId: CliqueId, targetId: CliqueId) => string;
export declare const propagatePotentials: (cliques: FastClique[], separators: number[][], upsert: (f: Formula) => Formula, formulas: Formula[], roots: CliqueId[]) => Messages;
export {};
