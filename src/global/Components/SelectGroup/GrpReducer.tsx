import { type Reducer } from 'react'
import { type IGroupRow } from "@/groups/types";
import  { type GrpsActions, GrpActionTypes, type IGrpState } from './types';

export const initialState: IGrpState = {
  loading: false,
  parentId: null,
  title: '',
  cats: []
}

export const GrpReducer: Reducer<IGrpState, GrpsActions> = (state, action) => {

  switch (action.type) {
    case GrpActionTypes.SET_LOADING:
      return {
        ...state,
        loading: true
      }

    case GrpActionTypes.SET_SUB_CATS: {
      const { subGrps } = action.payload;
      return {
        ...state,
        cats: state.cats.concat(subGrps),
        loading: false
      }
    }

    case GrpActionTypes.SET_ERROR: {
      const { error } = action.payload;
      return { ...state, error, loading: false };
    }

    case GrpActionTypes.SET_EXPANDED: {
      const { id, expanding } = action.payload;
      let { cats } = state;
      if (!expanding) {
        const ids = markForClean(cats, id!)
        console.log('clean:', ids)
        if (ids.length > 0) {
          cats = cats.filter(c => !ids.includes(c.id))
        }
      }
      return {
        ...state,
        cats: state.cats.map(c => c.id === id
          ? { ...c, isExpanded: expanding }
          : c
        )
      };
    }

    case GrpActionTypes.SET_PARENT_CAT: {
      const { cat } = action.payload;
      const { id, title } = cat;
      return {
        ...state,
        parentId: id!,
        title
      };
    }

    default:
      return state;  // TODO throw error
  }
};


function markForClean(cats: IGroupRow[], id: string | null) {
  let deca = cats
    .filter(c => c.parentId === id)
    .map(c => c.id)

  deca.forEach(id => {
    const unuci = id ? markForClean(cats, id) : [];
    deca = deca.concat(unuci);
  })
  return deca
}