import type { IGroupKey, IGroupRow } from '@/groups/types';

import type { ActionMap } from "@/global/types";

/////////////////////////////////////////////////////////////////////////
// DropDown Select Group

export interface IGrpState {
	loading: boolean,
	parentId: string | null,
	title: string,
	cats: IGroupRow[], // drop down groups
	error?: Error;
}

export interface IGrpInfo {
	selId: string | null;
	groupKey: IGroupKey | null,
	level: number,
	setParentId: (cat: IGroupRow) => void;
}

export enum GrpActionTypes {
	SET_LOADING = 'SET_LOADING',
	SET_SUB_CATS = 'SET_SUB_CATS',
	SET_ERROR = 'SET_ERROR',
	SET_EXPANDED = 'SET_EXPANDED',
	SET_PARENT_CAT = 'SET_PARENT_CAT'
}

export type GrpsPayload = {
	[GrpActionTypes.SET_LOADING]: false;

	[GrpActionTypes.SET_SUB_CATS]: {
		subGrps: IGroupRow[];
	};

	[GrpActionTypes.SET_EXPANDED]: {
		id: string;
		expanding: boolean;
	}

	[GrpActionTypes.SET_ERROR]: {
		error: Error;
	};

	[GrpActionTypes.SET_PARENT_CAT]: {
		cat: IGroupRow;
	};

};

export type GrpsActions =
	ActionMap<GrpsPayload>[keyof ActionMap<GrpsPayload>];



export type GrpActions = ActionMap<GrpsPayload>[keyof ActionMap<GrpsPayload>];