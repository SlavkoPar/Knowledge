import { useEffect, useState } from 'react';
import { useGroupContext } from '@/groups/GroupProvider'
import type { IAnswer } from "@/groups/types";
import AnswerForm from "@/groups/components/answers/AnswerForm";

const ViewAnswer = ({ inLine }: { inLine: boolean }) => {
    console.log(inLine ? "ViewAnswer inLine" : "ViewAnswer not inLine");
    const { state } = useGroupContext();
    const { activeAnswer } = state;
    //const { topId, id, parentId } = activeAnswer!;

    const [answer, setAnswer] = useState<IAnswer | null>(null);

    useEffect(() => {
        //const q = group!.answers.find(q => q.inEditing)
        //if (group) {
        //const q = group!.answers.find(q => q.id === id)
        console.log("#################################### ViewAnswer setAnswer ...", { activeAnswer })
        //if (q) {
        setAnswer(activeAnswer);
        //}
        //}
    }, [activeAnswer]) // answerLoading
    // if (answerLoading)
    //     return <div>Loading answer...</div>
    return (
        <AnswerForm
            answer={answer!}
            showCloseButton={true}
            source={0}
            submitForm={() => { }}
        >
            View Answer
        </AnswerForm>
    );
}

export default ViewAnswer;
