import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Lesson {
  id: number;
  title: string;
  duration: string;
  content: string;
  videoUrl: string;
}

interface Course {
  id: number;
  title: string;
  lessons: Lesson[];
}

const LessonViewer = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    fetch("/data/courses.json")
      .then((res) => res.json())
      .then((data) => {
        const foundCourse = data.find((c: Course) => c.id === Number(courseId));
        setCourse(foundCourse);
        
        if (foundCourse) {
          const foundLesson = foundCourse.lessons.find((l: Lesson) => l.id === Number(lessonId));
          setLesson(foundLesson);
        }

        const saved = localStorage.getItem(`course-${courseId}-progress`);
        if (saved) {
          const completed = JSON.parse(saved);
          setIsCompleted(completed.includes(Number(lessonId)));
        }
      })
      .catch((error) => console.error("Error loading lesson:", error));
  }, [courseId, lessonId]);

  const markAsCompleted = () => {
    const saved = localStorage.getItem(`course-${courseId}-progress`);
    let completed: number[] = saved ? JSON.parse(saved) : [];
    
    if (!completed.includes(Number(lessonId))) {
      completed.push(Number(lessonId));
      localStorage.setItem(`course-${courseId}-progress`, JSON.stringify(completed));
      setIsCompleted(true);
      toast.success("Lesson marked as completed!");
    }
  };

  const goToNextLesson = () => {
    if (!course || !lesson) return;
    const currentIndex = course.lessons.findIndex((l) => l.id === lesson.id);
    if (currentIndex < course.lessons.length - 1) {
      const nextLesson = course.lessons[currentIndex + 1];
      navigate(`/course/${courseId}/lesson/${nextLesson.id}`);
    } else {
      navigate(`/course/${courseId}`);
    }
  };

  const goToPreviousLesson = () => {
    if (!course || !lesson) return;
    const currentIndex = course.lessons.findIndex((l) => l.id === lesson.id);
    if (currentIndex > 0) {
      const prevLesson = course.lessons[currentIndex - 1];
      navigate(`/course/${courseId}/lesson/${prevLesson.id}`);
    }
  };

  if (!course || !lesson) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-lg text-muted-foreground">Loading...</p>
        </main>
      </div>
    );
  }

  const currentIndex = course.lessons.findIndex((l) => l.id === lesson.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < course.lessons.length - 1;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container max-w-5xl">
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

          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-secondary p-8 text-white">
              <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
              <p className="opacity-90">{course.title}</p>
            </div>

            <CardContent className="p-8 space-y-8">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="text-6xl">🎥</div>
                  <p className="text-muted-foreground">Video Player Placeholder</p>
                  <p className="text-sm text-muted-foreground">Duration: {lesson.duration}</p>
                </div>
              </div>

              <div className="prose prose-slate max-w-none">
                <h2 className="text-2xl font-bold mb-4">Lesson Content</h2>
                <p className="text-foreground leading-relaxed">{lesson.content}</p>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={goToPreviousLesson}
                  disabled={!hasPrevious}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous Lesson
                </Button>

                {!isCompleted && (
                  <Button
                    onClick={markAsCompleted}
                    className="bg-success hover:bg-success/90"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark as Completed
                  </Button>
                )}

                {isCompleted && (
                  <div className="flex items-center gap-2 text-success font-medium">
                    <CheckCircle2 className="h-5 w-5" />
                    Completed
                  </div>
                )}

                <Button
                  onClick={goToNextLesson}
                  disabled={!hasNext}
                  className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                >
                  {hasNext ? "Next Lesson" : "Back to Course"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default LessonViewer;
