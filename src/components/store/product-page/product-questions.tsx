import { MessageCircleMore, MessageCircleQuestion } from "lucide-react";
import { FC } from "react";

interface Question {
  question: string;
  answer: string;
}

interface Props {
  questions: Question[];
}

const ProductQuestions: FC<Props> = ({ questions }) => {
  return (
    <div className="pt-6">
      {/* Title */}
      <div className="h-12 flex items-center">
        <h2 className="text-main-primary text-xl md:text-2xl font-bold">
          Questions & Answers ({questions.length})
        </h2>
      </div>
      {/* List */}
      <div className="mt-4">
        <ul className="space-y-5">
          {questions.map((question, i) => (
            <li key={i} className="relative mb-1 bg-gray-50 p-4 rounded-lg">
              <div className="space-y-3">
                <div className="flex items-start gap-x-3">
                  <div className="mt-0.5 bg-white p-1.5 rounded-full shadow-sm text-main-primary">
                    <MessageCircleQuestion className="w-4 h-4" />
                  </div>
                  <p className="text-sm font-bold leading-5 pt-0.5">
                    {question.question}
                  </p>
                </div>
                <div className="flex items-start gap-x-3 pl-2 border-l-2 border-gray-200 ml-3">
                  <div className="pl-4">
                    <p className="text-sm leading-5 text-gray-700">{question.answer}</p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProductQuestions;
