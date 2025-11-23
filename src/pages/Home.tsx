import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import { useEffect, useState } from "react";

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
}

const Home = () => {
  const [trendingCourses, setTrendingCourses] = useState<Course[]>([]);

  useEffect(() => {
    fetch("/data/courses.json")
      .then((res) => res.json())
      .then((data) => {
        const trending = data.slice(0, 3);
        setTrendingCourses(trending);
      })
      .catch((error) => console.error("Error loading courses:", error));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Trending Courses
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Most popular courses chosen by our learners
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {trendingCourses.map((course) => (
                <CourseCard key={course.id} {...course} />
              ))}
            </div>
          </div>
        </section>

        <Categories />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
