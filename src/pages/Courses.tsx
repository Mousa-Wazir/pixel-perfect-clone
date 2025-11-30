import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  image_url: string;
  published: boolean;
  instructor: {
    full_name: string;
  };
}

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const instructorIds = [...new Set(data?.map(c => c.instructor_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', instructorIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      const coursesWithInstructors = data?.map(course => ({
        ...course,
        instructor: profileMap.get(course.instructor_id) || { full_name: 'Unknown' }
      })) || [];

      setCourses(coursesWithInstructors);
      setFilteredCourses(coursesWithInstructors);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = courses;

    if (searchQuery) {
      filtered = filtered.filter((course) =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((course) => course.category === categoryFilter);
    }

    if (levelFilter !== "all") {
      filtered = filtered.filter((course) => course.level === levelFilter.toLowerCase());
    }

    setFilteredCourses(filtered);
  }, [searchQuery, categoryFilter, levelFilter, courses]);

  const categories = ["all", ...Array.from(new Set(courses.map((c) => c.category)))];
  const levels = ["all", "Beginner", "Intermediate", "Advanced"];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-12 md:py-16">
        <div className="container">
          <div className="space-y-4 mb-12">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              All Courses
            </h1>
            <p className="text-lg text-muted-foreground">
              Explore our comprehensive library of {courses.length} expert-led courses
            </p>
          </div>

          <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                {levels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level === "all" ? "All Levels" : level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">Loading courses...</p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredCourses.map((course) => (
                  <Card key={course.id} className="flex flex-col overflow-hidden transition-all hover:shadow-[var(--shadow-hover)]">
                    <div
                      className="h-48 bg-cover bg-center"
                      style={{
                        backgroundImage: course.image_url
                          ? `url(${course.image_url})`
                          : 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))',
                      }}
                    />
                    <CardHeader className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="capitalize">
                          {course.level}
                        </Badge>
                        <Badge>{course.category}</Badge>
                      </div>
                      <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      By {course.instructor?.full_name || 'Unknown'}
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full">
                        <Link to={`/course/${course.id}`}>View Course</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {filteredCourses.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground">
                    No courses found matching your criteria
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Courses;