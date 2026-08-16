import { useEffect, useState } from "react";
import { UserPlus, BookOpen, CreditCard, Sparkles, Activity, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { getStudents } from "../../services/studentService";
import { getAdmissions } from "../../services/admissionService";
import { getPayments } from "../../services/paymentService";

function RecentActivities() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    loadLiveActivities();
  }, []);

  const loadLiveActivities = async () => {
    try {
      const [stdRes, admRes, pmtRes] = await Promise.all([
        getStudents().catch(() => null),
        getAdmissions().catch(() => null),
        getPayments().catch(() => null),
      ]);

      const liveList = [];

      if (stdRes && stdRes.data) {
        const stds = Array.isArray(stdRes.data) ? stdRes.data : stdRes.data.data || [];
        const recentStds = [...stds].reverse();
        recentStds.slice(0, 3).forEach((s, idx) => {
          const sName = s.name || `${s.firstName || ""} ${s.lastName || ""}`.trim() || "Student Partner";
          liveList.push({
            title: "New Student Partner Registered",
            desc: `${sName} enrolled in ${s.course || "Certified Track"} (${s.status || "Active"})`,
            icon: UserPlus,
            color: "text-[#cc785c] bg-[#efe9de]",
            time: idx === 0 ? "Just now" : `${(idx + 1) * 15} mins ago`,
          });
        });
      }

      if (admRes && admRes.data) {
        const adms = Array.isArray(admRes.data) ? admRes.data : admRes.data.data || [];
        const recentAdms = [...adms].reverse();
        recentAdms.slice(0, 2).forEach((a, idx) => {
          const sName = a.studentName || "Student Partner";
          const cName = a.courseName || "Course Track";
          liveList.push({
            title: "Admission Desk Enrollment",
            desc: `${sName} - ${cName} (Fee: ₹${Number(a.totalFee || 0).toLocaleString()})`,
            icon: CheckCircle2,
            color: "text-[#cc785c] bg-[#efe9de]",
            time: `${idx + 1} hour ago`,
          });
        });
      }

      if (pmtRes && pmtRes.data) {
        const pmts = Array.isArray(pmtRes.data) ? pmtRes.data : pmtRes.data.data || [];
        const recentPmts = [...pmts].reverse();
        recentPmts.slice(0, 2).forEach((p) => {
          liveList.push({
            title: "Fee Receipt Processed",
            desc: `Processed ₹${Number(p.amount || 0).toLocaleString()} for ${p.studentName || "Student"} via ${p.method || p.paymentMethod || "UPI"}`,
            icon: CreditCard,
            color: "text-[#006241] bg-[#d4e9e2]",
            time: "Today",
          });
        });
      }

      if (liveList.length > 0) {
        setActivities(liveList.slice(0, 5));
      }
    } catch (err) {
      console.log("Activities live load error:", err);
    }
  };

  return (
    <Card className="bg-[#efe9de] border-[#e6dfd8] shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-normal text-[#141413] tracking-tight font-serif-display flex items-center gap-2">
          <Activity className="h-5 w-5 text-[#cc785c]" />
          Recent Partner Activities
          <Sparkles className="h-3.5 w-3.5 text-[#cc785c] fill-current" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3.5">
          {activities.map((act, index) => {
            const Icon = act.icon;
            return (
              <div key={index} className="flex items-start gap-3.5 p-2.5 rounded-xl bg-[#faf9f5]/80 hover:bg-[#faf9f5] border border-[#e6dfd8]/60 transition">
                <div className={`h-9 w-9 rounded-full ${act.color} flex items-center justify-center shrink-0 mt-0.5 border border-[#e6dfd8]`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-serif-display text-[#141413] font-normal">{act.title}</h4>
                    <span className="text-[10px] text-[#6c6a64] font-medium">{act.time}</span>
                  </div>
                  <p className="text-xs text-[#6c6a64] mt-0.5 truncate font-medium">{act.desc}</p>
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