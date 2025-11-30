import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Clock, AlertCircle } from 'lucide-react';

interface Question {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  order_index: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  time_limit_minutes: number;
  passing_score: number;
  course_id: string;
}

const QuizTaker = () => {
  const { quizId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  useEffect(() => {
    if (started && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [started, timeRemaining]);

  const loadQuiz = async () => {
    try {
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single();

      if (quizError) throw quizError;
      setQuiz(quizData);

      const { data: questionsData, error: questionsError } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('order_index');

      if (questionsError) throw questionsError;
      setQuestions(questionsData);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    setStarted(true);
    if (quiz?.time_limit_minutes) {
      setTimeRemaining(quiz.time_limit_minutes * 60);
    }
  };

  const handleSubmit = async () => {
    if (!quiz || !user) return;

    let correctCount = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correct_answer) {
        correctCount++;
      }
    });

    const scorePercent = Math.round((correctCount / questions.length) * 100);
    setScore(scorePercent);
    setSubmitted(true);

    try {
      const { error } = await supabase.from('quiz_attempts').insert({
        quiz_id: quiz.id,
        user_id: user.id,
        score: scorePercent,
        total_questions: questions.length,
        answers: answers,
        started_at: new Date(Date.now() - (quiz.time_limit_minutes * 60 - timeRemaining) * 1000).toISOString(),
        completed_at: new Date().toISOString(),
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error saving results',
        description: error.message,
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-lg text-muted-foreground">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Card>
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
              <h2 className="text-xl font-bold mb-2">Quiz not found</h2>
              <p className="text-muted-foreground">This quiz doesn't exist or has no questions.</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (submitted) {
    const passed = score >= quiz.passing_score;
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 py-12">
          <div className="container max-w-2xl">
            <Card className={passed ? 'border-success' : 'border-destructive'}>
              <CardHeader>
                <CardTitle className="text-center text-3xl">Quiz Results</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className={`text-6xl font-bold ${passed ? 'text-success' : 'text-destructive'}`}>
                  {score}%
                </div>
                <div className="text-xl">
                  {passed ? (
                    <p className="text-success">Congratulations! You passed! 🎉</p>
                  ) : (
                    <p className="text-destructive">You need {quiz.passing_score}% to pass. Keep practicing!</p>
                  )}
                </div>
                <div className="text-muted-foreground">
                  You got {Math.round((score / 100) * questions.length)} out of {questions.length} questions correct
                </div>
                <Button onClick={() => navigate(`/course/${quiz.course_id}`)}>
                  Back to Course
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 py-12">
          <div className="container max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{quiz.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">{quiz.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Questions:</span>
                    <span className="font-semibold">{questions.length}</span>
                  </div>
                  {quiz.time_limit_minutes > 0 && (
                    <div className="flex justify-between">
                      <span>Time Limit:</span>
                      <span className="font-semibold">{quiz.time_limit_minutes} minutes</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Passing Score:</span>
                    <span className="font-semibold">{quiz.passing_score}%</span>
                  </div>
                </div>
                <Button onClick={startQuiz} className="w-full">
                  Start Quiz
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container max-w-2xl">
          {quiz.time_limit_minutes > 0 && (
            <Card className="mb-6">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span className="font-semibold">Time Remaining:</span>
                </div>
                <span className={`text-xl font-bold ${timeRemaining < 60 ? 'text-destructive' : ''}`}>
                  {formatTime(timeRemaining)}
                </span>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </CardHeader>
            <CardContent className="space-y-6">
              <h3 className="text-xl font-semibold">{currentQ.question_text}</h3>
              
              <RadioGroup
                value={answers[currentQ.id] || ''}
                onValueChange={(value) => setAnswers({ ...answers, [currentQ.id]: value })}
              >
                {['A', 'B', 'C', 'D'].map((option) => (
                  <div key={option} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer">
                    <RadioGroupItem value={option} id={`${currentQ.id}-${option}`} />
                    <Label htmlFor={`${currentQ.id}-${option}`} className="flex-1 cursor-pointer">
                      {currentQ[`option_${option.toLowerCase()}` as keyof Question]}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                >
                  Previous
                </Button>
                {currentQuestion === questions.length - 1 ? (
                  <Button onClick={handleSubmit}>
                    Submit Quiz
                  </Button>
                ) : (
                  <Button onClick={() => setCurrentQuestion(currentQuestion + 1)}>
                    Next
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default QuizTaker;