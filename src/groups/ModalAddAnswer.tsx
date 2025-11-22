import { useEffect, useState } from 'react'
import { Modal } from "react-bootstrap";

import { type IAnswerRow } from "./types";

import { useGlobalState } from "@/global/GlobalProvider";
//import { useGroupDispatch } from "./GroupProvider";

import AddAnswer from './components/answers/AddAnswer';

interface IProps {
    show: boolean,
    onHide: () => void;
    newAnswerRow: IAnswerRow
}

const ModalAddAnswer = (props: IProps) => {

    const { isDarkMode } = useGlobalState();

    // const handleClose = () => {
    //     setShowAddAnswer(false);
    // }

    const [createAnswerError, setCreateAnswerError] = useState("");

    //const dispatch = useGroupDispatch();

    useEffect(() => {
        (async () => {

        })()
    }, [])

    return (
        <Modal
            show={props.show}
            onHide={props.onHide}
            animation={true}
            centered
            size="lg"
            className="modal show"
            contentClassName={`${isDarkMode ? "bg-secondary bg-gradient" : "bg-info bg-gradient"}`}
        >
            <Modal.Header closeButton>
                Store new Answer to the Database
            </Modal.Header>
            <Modal.Body className="py-0">
                <AddAnswer
                    closeModal={props.onHide}
                    showCloseButton={false}
                    source={1} /*gmail*/
                    setError={(msg) => setCreateAnswerError(msg)}
                />
            </Modal.Body>
            <Modal.Footer>
                {createAnswerError}
            </Modal.Footer>
        </Modal>
    );
};

export default ModalAddAnswer;