import { useGroupContext } from '@/groups/GroupProvider'
//import { useGlobalContext, useGlobalState } from '@/global/GlobalProvider'

import AnswerForm from "@/groups/components/answers/AnswerForm";
import { type IAnswer } from "@/groups/types";

const EditAnswer = ({ /*inLine*/ }: { inLine: boolean }) => {
    const { state, updateAnswer } = useGroupContext();
    const { activeAnswer } = state;  // loadingAnswer: answerLoading, 
    if (!activeAnswer)
        return null;

    //const { topId } = activeAnswer!;


    if (!activeAnswer) {
        return <div>Loading answer to edit...</div>
    }

    const submitForm = async (answerObject: IAnswer) => {
        const newAnswer: IAnswer = {
            ...answerObject,
            created: undefined,
            modified: {
                time: new Date(),
                nickName: ''
            }
        }

        const { parentId } = activeAnswer;
        const groupChanged = parentId !== newAnswer.parentId;
        //const answerKey = new AnswerKey(activeAnswer).answerKey;
        /*const answer =*/ await updateAnswer(parentId!, newAnswer, groupChanged);
        /*
        if (activeAnswer.parentId !== answer.parentId) {
             await loadAndCacheAllGroupRows(); // reload, group could have been changed
             await openNode({ topId: '', id: q.parentId, answerId: q.id });
        }
        */

        // if (groupChanged) {
        //     setTimeout(() => dispatch({ type: ActionTypes.CLOSE_ANSWER_FORM, payload: { answer: answer } }), 1000);
        // }
    };

    return (
        <AnswerForm
            answer={activeAnswer!}
            showCloseButton={true}
            source={0}
            submitForm={submitForm}
        >
            Update Answer
        </AnswerForm>
    );
};

export default EditAnswer;
