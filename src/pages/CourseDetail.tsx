import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Users, Star, BookOpen, CheckCircle2, Circle, Play } from "lucide-react";

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
  description: string;
  category: string;
  level: string;
  duration: string;
  students: number;
  rating: number;
  instructor: string;
  price: number;
  thumbnail: string;
  lessons: Lesson[];
}

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetch("/data/courses.json")
      .then((res) => res.json())
      .then((data) => {
        const foundCourse = data.find((c: Course) => c.id === Number(id));
        setCourse(foundCourse);
        
        const saved = localStorage.getItem(`course-${id}-progress`);
        if (saved) {
          const completed = JSON.parse(saved);
          setCompletedLessons(completed);
          setProgress((completed.length / (foundCourse?.lessons.length || 1)) * 100);
        }
      })
      .catch((error) => console.error("Error loading course:", error));
  }, [id]);

  const getCourseImage = (thumbnail: string) => {
    try {
      return new URL(`../assets/courses/${thumbnail}.jpg`, import.meta.url).href;
    } catch {
      return "";
    }
  };

  if (!course) {
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

  const imageUrl = getCourseImage(course.thumbnail);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div
          className="relative h-80 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${imageUrl})`,
          }}
        >
          <div className="container h-full flex flex-col justify-end pb-12">
            <Badge className="mb-4 w-fit bg-background/90 text-foreground backdrop-blur-sm">
              {course.category}
            </Badge>
            <h1 className="text-4xl font-bold text-white md:text-5xl mb-4">
              {course.title}
            </h1>
            <p className="text-lg text-white/90 max-w-3xl">
              {course.description}
            </p>
          </div>
        </div>

        <div className="container py-12">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Course Progress</h2>
                    <span className="text-2xl font-bold text-primary">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                </CardContent>
              </Card>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Course Content</h2>
                <div className="space-y-3">
                  {course.lessons.map((lesson) => {
                    const isCompleted = completedLessons.includes(lesson.id);
                    return (
                      <Card
                        key={lesson.id}
                        className="transition-all hover:shadow-[var(--shadow-soft)] group"
                      >
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            {isCompleted ? (
                              <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                            )}
                            <div className="flex-1">
                              <h3 className="font-semibold group-hover:text-primary transition-colors">
                                {lesson.title}
                              </h3>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {lesson.duration}
                              </p>
                            </div>
                          </div>
                          <Button asChild variant="outline" size="sm">
                            <Link to={`/course/${course.id}/lesson/${lesson.id}`}>
                              <Play className="h-4 w-4 mr-2" />
                              {isCompleted ? "Review" : "Start"}
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {progress === 100 && (
                <Card className="bg-gradient-to-r from-success/10 to-success/5 border-success/20">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                      <CheckCircle2 className="h-8 w-8 text-success" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Course Completed!</h3>
                      <p className="text-muted-foreground mb-4">
                        Ready to test your knowledge?
                      </p>
                      <Button asChild className="bg-success hover:bg-success/90">
                        <Link to={`/course/${course.id}/quiz`}>
                          Take Final Quiz
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h3 className="font-bold mb-4">Course Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="secondary">{course.level}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                        <span>{course.lessons.length} Lessons</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{course.students.toLocaleString()} Students</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Star className="h-4 w-4 fill-accent text-accent" />
                        <span>{course.rating} Rating</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <h4 className="font-semibold mb-2">Instructor</h4>
                    <p className="text-sm text-muted-foreground">{course.instructor}</p>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Price</span>
                      <span className="text-2xl font-bold text-primary">${course.price}</span>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                      Enroll Now
                    </Button>
                  </div>
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

export default CourseDetail;
