import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BookOpen, Award, Clock, TrendingUp, Play, CheckCircle2 } from "lucide-react";

interface CourseProgress {
  id: number;
  title: string;
  thumbnail: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
}

interface QuizResult {
  courseId: number;
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
}

const Dashboard = () => {
  const [coursesProgress, setCoursesProgress] = useState<CourseProgress[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [totalProgress, setTotalProgress] = useState(0);

  useEffect(() => {
    fetch("/data/courses.json")
      .then((res) => res.json())
      .then((courses) => {
        const progressData: CourseProgress[] = [];
        const quizData: QuizResult[] = [];
        
        courses.forEach((course: any) => {
          const saved = localStorage.getItem(`course-${course.id}-progress`);
          if (saved) {
            const completed = JSON.parse(saved);
            const progress = (completed.length / course.lessons.length) * 100;
            progressData.push({
              id: course.id,
              title: course.title,
              thumbnail: course.thumbnail,
              progress,
              completedLessons: completed.length,
              totalLessons: course.lessons.length,
            });
          }

          const quizSaved = localStorage.getItem(`course-${course.id}-quiz`);
          if (quizSaved) {
            const quizResult = JSON.parse(quizSaved);
            quizData.push({
              courseId: course.id,
              ...quizResult,
            });
          }
        });

        setCoursesProgress(progressData);
        setQuizResults(quizData);
        
        if (progressData.length > 0) {
          const avgProgress = progressData.reduce((sum, c) => sum + c.progress, 0) / progressData.length;
          setTotalProgress(avgProgress);
        }
      })
      .catch((error) => console.error("Error loading dashboard:", error));
  }, []);

  const getCourseImage = (thumbnail: string) => {
    try {
      return new URL(`../assets/courses/${thumbnail}.jpg`, import.meta.url).href;
    } catch {
      return "";
    }
  };

  const completedCourses = coursesProgress.filter((c) => c.progress === 100).length;
  const passedQuizzes = quizResults.filter((q) => q.passed).length;
  const totalLessons = coursesProgress.reduce((sum, c) => sum + c.completedLessons, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-12 md:py-16 bg-muted/30">
        <div className="container">
          <div className="space-y-4 mb-12">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              My Dashboard
            </h1>
            <p className="text-lg text-muted-foreground">
              Track your learning progress and achievements
            </p>
          </div>

          <div className="grid gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Courses In Progress
                </CardTitle>
                <BookOpen className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{coursesProgress.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Completed Courses
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{completedCourses}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Lessons Completed
                </CardTitle>
                <Play className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalLessons}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Quizzes Passed
                </CardTitle>
                <Award className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{passedQuizzes}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Learning Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {coursesProgress.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground mb-4">
                        You haven't started any courses yet
                      </p>
                      <Button asChild className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                        <Link to="/courses">Browse Courses</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {coursesProgress.map((course) => {
                        const imageUrl = getCourseImage(course.thumbnail);
                        return (
                          <div key={course.id} className="flex gap-4">
                            <img
                              src={imageUrl}
                              alt={course.title}
                              className="h-20 w-28 rounded-lg object-cover"
                            />
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between">
                                <h3 className="font-semibold line-clamp-1">{course.title}</h3>
                                <span className="text-sm font-medium text-primary">
                                  {Math.round(course.progress)}%
                                </span>
                              </div>
                              <Progress value={course.progress} className="h-2" />
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                  {course.completedLessons} / {course.totalLessons} lessons
                                </p>
                                <Button asChild size="sm" variant="outline">
                                  <Link to={`/course/${course.id}`}>Continue</Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-accent" />
                    Quiz Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {quizResults.length === 0 ? (
                    <div className="text-center py-8">
                      <Award className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        No quiz results yet
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {quizResults.map((result, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border-2 ${
                            result.passed
                              ? "border-success/50 bg-success/5"
                              : "border-destructive/50 bg-destructive/5"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">
                              {result.passed ? "Passed" : "Failed"}
                            </span>
                            <span className="text-lg font-bold text-primary">
                              {Math.round(result.percentage)}%
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Score: {result.score}/{result.total}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Keep Going!
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Overall Progress
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bold text-primary">
                        {Math.round(totalProgress)}%
                      </span>
                    </div>
                    <Progress value={totalProgress} className="h-3" />
                  </div>
                  <Button asChild className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                    <Link to="/courses">Explore More Courses</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
