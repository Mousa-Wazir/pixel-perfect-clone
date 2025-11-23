import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle2, XCircle, Trophy } from "lucide-react";

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

interface Course {
  id: number;
  title: string;
  quiz: QuizQuestion[];
}

const Quiz = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetch("/data/courses.json")
      .then((res) => res.json())
      .then((data) => {
        const foundCourse = data.find((c: Course) => c.id === Number(courseId));
        setCourse(foundCourse);
      })
      .catch((error) => console.error("Error loading quiz:", error));
  }, [courseId]);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (course && currentQuestion < course.quiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    if (!course) return;
    
    let correctCount = 0;
    course.quiz.forEach((question, index) => {
      if (selectedAnswers[index] === question.correct) {
        correctCount++;
      }
    });
    
    setScore(correctCount);
    setShowResults(true);
    
    const quizData = {
      score: correctCount,
      total: course.quiz.length,
      percentage: (correctCount / course.quiz.length) * 100,
      passed: (correctCount / course.quiz.length) >= 0.6,
    };
    
    localStorage.setItem(`course-${courseId}-quiz`, JSON.stringify(quizData));
  };

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-lg text-muted-foreground">Loading...</p>
        </main>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / course.quiz.length) * 100;
  const percentage = (score / course.quiz.length) * 100;
  const passed = percentage >= 60;

  if (showResults) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 py-12">
          <div className="container max-w-3xl">
            <Card className="overflow-hidden">
              <div
                className={`p-8 text-white ${
                  passed
                    ? "bg-gradient-to-r from-success to-success/80"
                    : "bg-gradient-to-r from-destructive to-destructive/80"
                }`}
              >
                <div className="text-center space-y-4">
                  <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                    {passed ? (
                      <Trophy className="h-10 w-10" />
                    ) : (
                      <XCircle className="h-10 w-10" />
                    )}
                  </div>
                  <h1 className="text-3xl font-bold">
                    {passed ? "Congratulations!" : "Keep Learning!"}
                  </h1>
                  <p className="text-lg opacity-90">
                    You scored {score} out of {course.quiz.length} ({Math.round(percentage)}%)
                  </p>
                </div>
              </div>

              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  {course.quiz.map((question, index) => {
                    const userAnswer = selectedAnswers[index];
                    const isCorrect = userAnswer === question.correct;
                    
                    return (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-2 ${
                          isCorrect
                            ? "border-success/50 bg-success/5"
                            : "border-destructive/50 bg-destructive/5"
                        }`}
                      >
                        <div className="flex items-start gap-3 mb-2">
                          {isCorrect ? (
                            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className="font-semibold mb-2">{question.question}</p>
                            <p className="text-sm text-muted-foreground">
                              Your answer: {question.options[userAnswer]}
                            </p>
                            {!isCorrect && (
                              <p className="text-sm text-success mt-1">
                                Correct answer: {question.options[question.correct]}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    asChild
                    className="flex-1"
                  >
                    <Link to={`/course/${courseId}`}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Course
                    </Link>
                  </Button>
                  <Button
                    onClick={() => {
                      setCurrentQuestion(0);
                      setSelectedAnswers([]);
                      setShowResults(false);
                      setScore(0);
                    }}
                    className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                  >
                    Retake Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container max-w-3xl">
          <Button
            variant="ghost"
            asChild
            className="mb-6"
          >
            <Link to={`/course/${courseId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Link>
          </Button>

          <Card>
            <CardHeader className="bg-gradient-to-r from-primary to-secondary text-white">
              <CardTitle className="text-2xl">{course.title} - Final Quiz</CardTitle>
              <div className="space-y-2 pt-4">
                <div className="flex justify-between text-sm opacity-90">
                  <span>Question {currentQuestion + 1} of {course.quiz.length}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2 bg-white/20" />
              </div>
            </CardHeader>

            <CardContent className="p-8">
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">
                  {course.quiz[currentQuestion].question}
                </h3>

                <RadioGroup
                  value={selectedAnswers[currentQuestion]?.toString()}
                  onValueChange={(value) => handleAnswerSelect(Number(value))}
                >
                  <div className="space-y-3">
                    {course.quiz[currentQuestion].options.map((option, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted cursor-pointer"
                      >
                        <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                        <Label
                          htmlFor={`option-${index}`}
                          className="flex-1 cursor-pointer"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>

                <div className="flex justify-between pt-6 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>

                  {currentQuestion < course.quiz.length - 1 ? (
                    <Button
                      onClick={handleNext}
                      disabled={selectedAnswers[currentQuestion] === undefined}
                      className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                    >
                      Next
                      <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={selectedAnswers.length !== course.quiz.length}
                      className="bg-success hover:bg-success/90"
                    >
                      Submit Quiz
                      <CheckCircle2 className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Quiz;
