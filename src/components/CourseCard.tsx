import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, Star } from "lucide-react";
import { Link } from "react-router-dom";

interface CourseCardProps {
  id: number;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  students: number;
  rating: number;
  instructor: string;
  thumbnail: string;
  price: number;
}

const getCourseImage = (thumbnail: string) => {
  try {
    return new URL(`../assets/courses/${thumbnail}.jpg`, import.meta.url).href;
  } catch {
    return "";
  }
};

const CourseCard = ({ id, title, category, level, duration, students, rating, price, thumbnail }: CourseCardProps) => {
  const imageUrl = getCourseImage(thumbnail);

  return (
    <Card className="group overflow-hidden border-border/50 transition-all duration-300 hover:shadow-[var(--shadow-hover)] hover:-translate-y-1">
      <div className="relative overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <Badge className="absolute right-3 top-3 bg-background/90 text-foreground backdrop-blur-sm">
          {category}
        </Badge>
      </div>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {level}
          </Badge>
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-accent text-accent" />
            <span className="font-medium">{rating}</span>
          </div>
        </div>
        <h3 className="line-clamp-2 text-lg font-bold leading-tight text-foreground group-hover:text-primary transition-colors">
          {title}
        </h3>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{students.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t border-border/50 p-5">
        <div className="text-2xl font-bold text-primary">${price}</div>
        <Button asChild className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
          <Link to={`/course/${id}`}>Start Course</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
