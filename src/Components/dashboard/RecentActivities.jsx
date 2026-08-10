import { CheckCircle2, UserPlus, BookOpen, CreditCard, Award, Activity, Star } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

function RecentActivities() {
  const activities = [
    { title: "New Partner Admission", desc: "Natasha Tambe registered for Java Full Stack", icon: UserPlus, color: "text-[#00754A] bg-[#d4e9e2]", time: "10 mins ago" },
    { title: "Syllabus Update", desc: "Java Track updated to Starbucks 2026 standard", icon: BookOpen, color: "text-[#1E3932] bg-[#edebe9]", time: "1 hour ago" },
    { title: "Fee Receipt Generated", desc: "Processed ₹35,000 via UPI Transfer", icon: CreditCard, color: "text-[#006241] bg-[#d4e9e2]", time: "3 hours ago" },
    { title: "Gold Status Awarded", desc: "Rahul Sharma completed Gold Tier milestone", icon: Star, color: "text-[#cba258] bg-[#faf6ee]", time: "Yesterday" },
    { title: "New Course Batch Added", desc: "Advanced React & Next.js batch active", icon: CheckCircle2, color: "text-[#00754A] bg-[#d4e9e2]", time: "2 days ago" },
  ];

  return (
    <Card className="sb-shadow-card">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-[#006241] flex items-center gap-2">
          <Activity className="h-5 w-5 text-[#00754A]" />
          Recent Partner Activities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3.5">
          {activities.map((act, index) => {
            const Icon = act.icon;
            return (
              <div key={index} className="flex items-start gap-3.5 p-2.5 rounded-xl hover:bg-[#f2f0eb]/60 transition">
                <div className={`h-9 w-9 rounded-full ${act.color} flex items-center justify-center shrink-0 mt-0.5`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-extrabold text-[#1E3932]">{act.title}</h4>
                    <span className="text-[11px] text-slate-400 font-semibold">{act.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate font-medium">{act.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default RecentActivities;