import React from 'react';

interface QuickQuestionsProps {
  onSelect: (question: string) => void;
}

const QUICK_QUESTIONS = [
  "APA 7th 如何引用书籍？",
  "图书馆周日几点开门？",
  "安静学习区在哪里？",
  "校外怎么访问IEEE Xplore？",
  "一次最多可以借几本书？",
];

const QuickQuestions: React.FC<QuickQuestionsProps> = ({ onSelect }) => {
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      <p className="w-full text-sm text-gray-500 mb-1">快捷提问：</p>
      {QUICK_QUESTIONS.map((q) => (
        <button
          key={q}
          onClick={() => onSelect(q)}
          className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
        >
          {q}
        </button>
      ))}
    </div>
  );
};

export default QuickQuestions;
