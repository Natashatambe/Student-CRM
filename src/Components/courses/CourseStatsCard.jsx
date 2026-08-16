import { BookOpen, CheckCircle, XCircle } from "lucide-react";
import StatCard from "../common/StatCard";

function CourseStatsCard({ title, value }) {
  const getIcon = () => {
    switch (title) {
      case "Total Courses":
        return BookOpen;
      case "Active Courses":
        return CheckCircle;
      case "Inactive Courses":
        return XCircle;
      default:
        return BookOpen;
    }
  };

  const getSubtitle = () => {
    switch (title) {
      case "Total Courses":
        return "All catalog tracks";
      case "Active Courses":
        return "Available for enrollment";
      case "Inactive Courses":
        return "Archived or full";
      default:
        return "";
    }
  };

  return (
    <StatCard
      title={title}
      value={value}
      subtitle={getSubtitle()}
      icon={getIcon()}
      badgeText={title === "Active Courses" ? "Active" : undefined}
    />
  );
}

export default CourseStatsCard;