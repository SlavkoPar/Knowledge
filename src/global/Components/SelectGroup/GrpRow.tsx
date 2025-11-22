import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretRight, faCaretDown } from '@fortawesome/free-solid-svg-icons'

import { ListGroup, Button } from "react-bootstrap";

import { type IGroupRow } from "@/groups/types";

import GrpList from "@/global/Components/SelectGroup/GrpList";
import { type GrpsActions, GrpActionTypes } from './types';

interface IGrpRow {
    cat: IGroupRow;
    selId: string | null;
    dispatch: React.Dispatch<GrpsActions>;
    setParentGrp: (cat: IGroupRow) => void;
}

const GrpRow = ({ cat, dispatch, setParentGrp, selId }: IGrpRow) => {
    const { topId, parentId, id, title, level, isExpanded } = cat;
    const groupKey = { topId, parentId, id };

    //const { isDarkMode, variant, bg } = useGlobalState();

    const expand = (_id: IDBValidKey) => {
        dispatch({ type: GrpActionTypes.SET_EXPANDED, payload: { id, expanding: !isExpanded } });
    }

    const onSelectGrp = (cat: IGroupRow) => {
        // Load data from server and reinitialize group
        // viewGroup(id);
        setParentGrp(cat);
    }

    const Row1 =
        <div className="d-flex justify-content-start align-items-center w-100 text-primary">
            <Button
                variant='link'
                size="sm"
                className="py-0 px-1"
                onClick={(e) => {
                    expand(id!);
                    e.stopPropagation();
                    e.preventDefault();
                }}
                title="Expand"
            >
                <FontAwesomeIcon icon={isExpanded ? faCaretDown : faCaretRight} size='lg' />
            </Button>
            <Button
                variant='link'
                size="sm"
                className={`py-0 mx-0 text-decoration-none`}
                title={id}
                onClick={() => onSelectGrp(cat)}
            >
                {title}
            </Button>
        </div>

    return (
        <>
            <ListGroup.Item
                variant={"primary"}
                className="py-0 px-1 w-100"
                as="li"
            >
                {Row1}
            </ListGroup.Item>

            {isExpanded && // Row2
                <ListGroup.Item
                    className="py-0 px-0"
                    variant={"primary"}
                    as="li"
                >
                    <GrpList
                        selId={selId}
                        level={level + 1}
                        groupKey={groupKey}
                        setParentId={setParentGrp}
                    />
                </ListGroup.Item>
            }

        </>
    );
};

export default GrpRow;
