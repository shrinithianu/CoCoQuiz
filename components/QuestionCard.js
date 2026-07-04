import React from "react";
const OPTS = ["A","B","C","D"];
export default function QuestionCard({ question, index, total, selected, onSelect }) {
  return (
    <div className="question-card">
      <div className="question-meta">
        <span className="q-number">Question {index+1} of {total}</span>
        <span className="q-marks">{question.marks} mark{question.marks>1?"s":""}</span>
      </div>
      <p className="question-text">{question.question_text}</p>
      <div className="options-grid">
        {OPTS.map(opt => (
          <button key={opt} className={`option-btn ${selected===opt?"option-selected":""}`} onClick={()=>onSelect(question.id,opt)}>
            <span className="option-label">{opt}</span>
            <span className="option-text">{question[`option_${opt.toLowerCase()}`]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
