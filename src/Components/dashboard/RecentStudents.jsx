import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, UserCheck } from "lucide-react";

function RecentStudents() {
  const navigate = useNavigate();

  const students = [
    { name: "Natasha Tambe", course: "Java Full Stack", status: "Active", date: "Today" },
    { name: "Rahul Sharma", course: "Python Masterclass", status: "Active", date: "Yesterday" },
    { name: "Priya Patel", course: "React JS Track", status: "Pending", date: "2 days ago" },
    { name: "Amit Joshi", course: "Data Science & AI", status: "Active", date: "3 days ago" },
    { name: "Sneha Patil", course: "UI/UX Design", status: "Active", date: "4 days ago" },
  ];

  return (
    <Card className="bg-[#efe9de] border-[#e6dfd8]">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-xl font-normal text-[#141413] flex items-center gap-2 font-serif-display">
          <UserCheck className="h-4.5 w-4.5 text-[#cc785c]" />
          Recent Enrollments
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/students")}
          className="text-xs text-[#cc785c] hover:text-[#a9583e] font-medium gap-1"
        >
          View All <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-[#e6dfd8]">
          {students.map((student, index) => {
            const initials = student.name
              .split(" ")
              .map((n) => n[0])
              .join("");
            const dicebearAvatar = `https://api.dicebear.com/10.x/glyphs/svg?seed=${encodeURIComponent(student.name)}`;

            return (
              <div key={index} className="py-3 flex items-center justify-between hover:bg-[#faf9f5]/60 px-2 rounded-md transition">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8.5 w-8.5 ring-1 ring-[#cc785c]/40 bg-[#faf9f5]">
                    <AvatarImage src={dicebearAvatar} alt={student.name} />
                    <AvatarFallback className="bg-[#cc785c] text-white text-xs font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="text-base font-serif-display font-normal text-[#141413] leading-tight">{student.name}</h4>
                    <p className="text-xs text-[#6c6a64] font-medium">{student.course}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-[#8e8b82] font-medium hidden sm:inline-block">
                    {student.date}
                  </span>
                  <Badge variant={student.status === "Active" ? "success" : "amber"}>
                    {student.status}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default RecentStudents;