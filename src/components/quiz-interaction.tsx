"use client";

import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

interface QuizQuestion {
  options: string[];
  question: string;
  explanation: string;
  correct_answer: string;
}

export default function QuizInteraction({ quiz }: { quiz: QuizQuestion[] }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnswer = (answer: string) => {
    if (isAnswered) return;
    setSelectedAnswer(answer);
    setIsAnswered(true);
    if (answer === quiz[currentQuestion]?.correct_answer) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < quiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="mb-2 text-xl font-semibold">
          Question {currentQuestion + 1} of {quiz.length}
        </h2>
        <p className="mb-2">
          {quiz[currentQuestion]?.question.split("```")[0]}
        </p>
        <pre className="overflow-x-auto rounded-md bg-gray-100 p-4">
          <code>{quiz[currentQuestion]?.question.split("```")[1]}</code>
        </pre>
      </div>
      <div className="space-y-2">
        {quiz[currentQuestion]?.options.map((option, index) => (
          <Button
            key={index}
            className={`w-full justify-start text-left ${
              isAnswered
                ? option === quiz[currentQuestion]?.correct_answer
                  ? "bg-green-500 hover:bg-green-600"
                  : option === selectedAnswer
                    ? "bg-red-500 hover:bg-red-600"
                    : ""
                : ""
            }`}
            onClick={() => handleAnswer(option)}
            disabled={isAnswered}
          >
            {option}
            {isAnswered && option === quiz[currentQuestion]?.correct_answer && (
              <CheckCircle className="ml-auto" />
            )}
            {isAnswered &&
              option === selectedAnswer &&
              option !== quiz[currentQuestion]?.correct_answer && (
                <XCircle className="ml-auto" />
              )}
          </Button>
        ))}
      </div>
      {isAnswered && (
        <div className="mt-4 rounded-md bg-blue-100 p-4">
          <p className="font-semibold">Explanation:</p>
          <p>{quiz[currentQuestion]?.explanation}</p>
        </div>
      )}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-lg font-semibold">
          Score: {score}/{quiz.length}
        </div>
        {currentQuestion < quiz.length - 1 ? (
          <Button onClick={nextQuestion} disabled={!isAnswered}>
            Next Question
          </Button>
        ) : (
          <Button
            onClick={() =>
              alert(`Quiz completed! Your score: ${score}/${quiz.length}`)
            }
          >
            Finish Quiz
          </Button>
        )}
      </div>
    </div>
  );
}
