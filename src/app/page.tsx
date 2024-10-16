"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useToast } from "~/hooks/use-toast";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PublishQuiz } from "~/action";

interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

interface QuizData {
  quiz: QuizQuestion[];
}

export default function QuizApp() {
  const [userInput, setUserInput] = useState("");
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("/api/generate-quiz", { input: userInput });
      setQuizData(res.data.res);
    } catch (error) {
      console.error("Error fetching quiz data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quizData!.quiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowExplanation(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setShowExplanation(false);
    }
  };

  const handlePublish = async () => {
    try {
      const data = await PublishQuiz(quizData);
      const id = data[0]?.id;
      if (id) {
        const currentUrl = window.location.href;
        await navigator.clipboard.writeText(`${currentUrl}quiz/${id}`);
        toast({
          title: "Quiz published!",
          description:
            "The URL for the quiz has been copied to your clipboard.",
        });
      }
    } catch (error) {
      console.error("Error publishing the quiz:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-xl font-semibold">Loading quiz...</p>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="container mx-auto flex min-h-screen w-[400px] items-center justify-center p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Quiz App</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="w-[700px] max-md:w-[500px] max-sm:w-[320px]">
                <Label htmlFor="quiz-topic">Enter quiz topic</Label>
                <Input
                  id="quiz-topic"
                  type="text"
                  placeholder="e.g., Python programming"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                />
              </div>
              <Button type="submit">Generate Quiz</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex min-h-screen max-w-2xl items-center justify-center p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Quiz App</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <h2 className="mb-2 text-xl font-semibold">
              Question {currentQuestion + 1}
            </h2>
            <p className="whitespace-pre-wrap">
              {quizData.quiz[currentQuestion]?.question}
            </p>
          </div>
          <div className="space-y-2">
            {quizData.quiz[currentQuestion]?.options.map((option, index) => (
              <div key={index} className="rounded-md border p-2">
                {option}
              </div>
            ))}
          </div>
          {showExplanation && (
            <div className="mt-4 rounded-md bg-blue-50 p-4">
              <p className="font-semibold">Explanation:</p>
              <p>{quizData.quiz[currentQuestion]?.explanation}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <Button
            onClick={handlePreviousQuestion}
            disabled={currentQuestion === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <Button onClick={() => setShowExplanation(!showExplanation)}>
            {showExplanation ? "Hide" : "Show"} Explanation
          </Button>
          <Button
            onClick={handleNextQuestion}
            disabled={currentQuestion === quizData.quiz.length - 1}
          >
            Next <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
        <CardFooter className="justify-center">
          <Button
            onClick={handlePublish}
            className="bg-green-500 hover:bg-green-600"
          >
            Publish Quiz
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
