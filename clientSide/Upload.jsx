import React from 'react';
import Question from './Question';

function Upload() {
  const questions = ['Q1: What is Photosynthesis.']; // Add as many questions as needed

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Auto Evaluation</h1>
      {questions.map((question, index) => (
        <Question key={index} questionText={question} />
      ))}
    </div>
  );
}

export default Upload;
