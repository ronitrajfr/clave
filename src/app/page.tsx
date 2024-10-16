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
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { CheckCircle2, XCircle } from "lucide-react";
import { PublishQuiz } from "~/action";
import { useRouter } from "next/navigation";

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
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("/api/generate-quiz", {
        input: userInput,
      });
      console.log(res.data.res);
      setQuizData(res.data.res);
    } catch (error) {
      console.error("Error fetching quiz data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    setShowResult(true);
    if (quizData && answer === quizData.quiz[currentQuestion]?.correct_answer) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer("");
    setShowResult(false);
    setCurrentQuestion(currentQuestion + 1);
  };

  const handlePublish = async () => {
    try {
      const data = await PublishQuiz(quizData);
      const id = data[0]?.id;
      console.log(id);

      if (id) {
        // Copy the id to the clipboard
        await navigator.clipboard.writeText(`http://localhost:3000/quiz/${id}`);
        console.log("ID copied to clipboard!");

        toast({
          title: "Quiz published!",
          description:
            "The URL for the quiz has been copied to your clipboard.",
        });

        // Redirect to the quiz page
        router.push(`/quiz/${id}`);
      }
    } catch (error) {
      console.error("Error publishing the quiz:", error);
    }
  };

  const isLastQuestion = quizData
    ? currentQuestion === quizData.quiz.length - 1
    : false;

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
      <Card>
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
          <RadioGroup
            value={selectedAnswer}
            onValueChange={handleAnswerSelect}
            className="space-y-2"
          >
            {quizData.quiz[currentQuestion]?.options.map((option, index) => (
              <div
                key={index}
                className={`flex items-center space-x-2 rounded-md p-2 ${
                  showResult
                    ? option === quizData.quiz[currentQuestion]?.correct_answer
                      ? "bg-green-100"
                      : option === selectedAnswer
                        ? "bg-red-100"
                        : ""
                    : "hover:bg-gray-100"
                }`}
              >
                <RadioGroupItem
                  value={option}
                  id={`option-${index}`}
                  disabled={showResult}
                />
                <Label
                  htmlFor={`option-${index}`}
                  className="flex-grow cursor-pointer"
                >
                  {option}
                </Label>
                {showResult &&
                  option === quizData.quiz[currentQuestion]?.correct_answer && (
                    <CheckCircle2 className="text-green-500" />
                  )}
                {showResult &&
                  option === selectedAnswer &&
                  option !== quizData.quiz[currentQuestion]?.correct_answer && (
                    <XCircle className="text-red-500" />
                  )}
              </div>
            ))}
          </RadioGroup>
          {showResult && (
            <div className="mt-4 rounded-md bg-blue-50 p-4">
              <p className="font-semibold">Explanation:</p>
              <p>{quizData.quiz[currentQuestion]?.explanation}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="text-lg font-semibold">
            Score: {score}/{quizData.quiz.length}
          </div>
          {showResult && !isLastQuestion && (
            <Button onClick={handleNextQuestion}>Next Question</Button>
          )}
          {isLastQuestion && showResult && (
            <Button
              onClick={handlePublish}
              className="bg-green-500 hover:bg-green-600"
            >
              Publish
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
