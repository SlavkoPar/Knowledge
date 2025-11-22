import { useEffect, useReducer, useState } from "react";
import { ListGroup } from "react-bootstrap";
import GrpRow from "@/global/Components/SelectGroup/GrpRow";
import { GrpReducer, initialState } from "@/global/Components/SelectGroup/GrpReducer";
//import { useGlobalContext } from "@/global/GlobalProvider";
import { GrpActionTypes, type IGrpInfo } from "./types";
import type { IGroupKey, IGroupRow } from "@/groups/types";
import { useGroupContext } from "@/groups/GroupProvider";

const GrpList = ({ selId, groupKey, level, setParentId }: IGrpInfo) => {
    const [state, dispatch] = useReducer(GrpReducer, initialState);
    const { getSubGrps } = useGroupContext();

    const { id } = groupKey ?? { id: null };
    const [catKey] = useState<IGroupKey | null>(groupKey)

    useEffect(() => {
        (async () => {
            const res = await getSubGrps(id);
            const { subGrps } = res;
            dispatch({ type: GrpActionTypes.SET_SUB_CATS, payload: { subGrps } });
        })()
    }, [getSubGrps, catKey, id]);

    const mySubGrps = state.cats.filter(c => c.parentId === id);

    const setParentGrp = (cat: IGroupRow) => {
        dispatch({ type: GrpActionTypes.SET_PARENT_CAT, payload: { cat } })
        setParentId!(cat);
    }

    return (
        <div className={level > 1 ? 'border  border-7 ms-4 h-25' : 'border border-7  h-25'} style={{ overflowY: 'auto' }}>
            <ListGroup as="ul" variant='dark' className="mb-0">
                {mySubGrps.filter(c => c.id !== selId).map((cat: IGroupRow) =>
                    <GrpRow
                        cat={cat}
                        selId={selId}
                        dispatch={dispatch}
                        setParentGrp={setParentGrp}
                        key={cat.id}
                    />
                )
                }
            </ListGroup>

            {state.error && state.error.message}
        </div>
    );
};

export default GrpList;
