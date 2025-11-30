import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Edit, Trash2, GripVertical } from 'lucide-react';

interface Lesson {
  id?: string;
  title: string;
  content: string;
  video_url: string;
  order_index: number;
  duration_minutes: number;
}

interface Quiz {
  id?: string;
  title: string;
  description: string;
  time_limit_minutes: number;
  passing_score: number;
}

const CourseEditor = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isNew = !id;

  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('beginner');
  const [imageUrl, setImageUrl] = useState('');
  const [published, setPublished] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    if (!isNew && id) {
      loadCourse();
    }
  }, [id, isNew]);

  const loadCourse = async () => {
    try {
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

      if (courseError) throw courseError;

      setTitle(course.title);
      setDescription(course.description || '');
      setCategory(course.category);
      setLevel(course.level);
      setImageUrl(course.image_url || '');
      setPublished(course.published);

      const { data: lessonsData } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', id)
        .order('order_index');

      setLessons(lessonsData || []);

      const { data: quizzesData } = await supabase
        .from('quizzes')
        .select('*')
        .eq('course_id', id);

      setQuizzes(quizzesData || []);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isNew) {
        const { data, error } = await supabase
          .from('courses')
          .insert({
            instructor_id: user!.id,
            title,
            description,
            category,
            level,
            image_url: imageUrl,
            published,
          })
          .select()
          .single();

        if (error) throw error;

        toast({
          title: 'Course created',
          description: 'Your course has been created successfully.',
        });
        navigate(`/instructor/course/${data.id}/edit`);
      } else {
        const { error } = await supabase
          .from('courses')
          .update({
            title,
            description,
            category,
            level,
            image_url: imageUrl,
            published,
          })
          .eq('id', id);

        if (error) throw error;

        toast({
          title: 'Course updated',
          description: 'Your course has been updated successfully.',
        });
      }
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => navigate('/instructor/dashboard')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <h1 className="text-4xl font-bold mb-8">
            {isNew ? 'Create New Course' : 'Edit Course'}
          </h1>

          <Tabs defaultValue="details" className="space-y-6">
            <TabsList>
              <TabsTrigger value="details">Course Details</TabsTrigger>
              {!isNew && <TabsTrigger value="lessons">Lessons</TabsTrigger>}
              {!isNew && <TabsTrigger value="quizzes">Quizzes</TabsTrigger>}
            </TabsList>

            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Course Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Course Title *</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Input
                          id="category"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          placeholder="e.g., Programming, Design"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="level">Level *</Label>
                        <Select value={level} onValueChange={setLevel}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="imageUrl">Course Image URL</Label>
                      <Input
                        id="imageUrl"
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="published"
                        checked={published}
                        onCheckedChange={setPublished}
                      />
                      <Label htmlFor="published">Publish course</Label>
                    </div>

                    <Button type="submit" disabled={loading}>
                      {loading ? 'Saving...' : isNew ? 'Create Course' : 'Update Course'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {!isNew && (
              <TabsContent value="lessons">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Lessons</CardTitle>
                    <Button asChild size="sm">
                      <a href={`/instructor/course/${id}/lesson/new`}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Lesson
                      </a>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {lessons.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        No lessons yet. Add your first lesson to get started.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {lessons.map((lesson, index) => (
                          <div
                            key={lesson.id}
                            className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                          >
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                            <div className="flex-1">
                              <div className="font-medium">{lesson.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {lesson.duration_minutes} minutes
                              </div>
                            </div>
                            <Button asChild variant="ghost" size="sm">
                              <a href={`/instructor/course/${id}/lesson/${lesson.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {!isNew && (
              <TabsContent value="quizzes">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Quizzes</CardTitle>
                    <Button asChild size="sm">
                      <a href={`/instructor/course/${id}/quiz/new`}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Quiz
                      </a>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {quizzes.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        No quizzes yet. Add a quiz to test student knowledge.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {quizzes.map((quiz) => (
                          <div
                            key={quiz.id}
                            className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="font-medium">{quiz.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {quiz.time_limit_minutes} min • {quiz.passing_score}% to pass
                              </div>
                            </div>
                            <Button asChild variant="ghost" size="sm">
                              <a href={`/instructor/course/${id}/quiz/${quiz.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CourseEditor;