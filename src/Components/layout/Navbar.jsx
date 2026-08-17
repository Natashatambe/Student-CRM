import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  Sparkles,
  Menu,
  ChevronDown,
  GraduationCap,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { getStudents } from "../../services/studentService";
import { getAdmissions } from "../../services/admissionService";
import { getPayments } from "../../services/paymentService";

function Navbar({ collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [openNotif, setOpenNotif] = useState(false);
  const [searchCategory, setSearchCategory] = useState("all");
  const [notifications, setNotifications] = useState([]);

  const loadLiveNotifications = async () => {
    try {
      const [stdRes, admRes, payRes] = await Promise.all([
        getStudents().catch(() => null),
        getAdmissions().catch(() => null),
        getPayments().catch(() => null),
      ]);

      const notifList = [];

      // 1. Real-time Student Registrations
      if (stdRes && stdRes.data) {
        const stds = Array.isArray(stdRes.data) ? stdRes.data : stdRes.data.data || [];
        stds.slice(-3).reverse().forEach((s, idx) => {
          const name = s.name || `${s.firstName || ""} ${s.lastName || ""}`.trim() || "Student Partner";
          notifList.push({
            id: `std-${s.id || s.studentId || idx}`,
            title: "New Student Partner Registered",
            desc: `${name} registered for ${s.course || "Course Track"}.`,
            time: idx === 0 ? "Just now" : `${(idx + 1) * 3} mins ago`,
            read: false,
          });
        });
      }

      // 2. Real-time Admissions Desk Enrollments
      if (admRes && admRes.data) {
        const adms = Array.isArray(admRes.data) ? admRes.data : admRes.data.data || [];
        adms.slice(-3).reverse().forEach((a, idx) => {
          const sName = a.studentName || (a.student ? a.student.name : "Student Partner");
          const cName = a.courseName || (a.course ? a.course.name : "Course Track");
          const fee = Number(a.totalFee || 0);
          notifList.push({
            id: `adm-${a.admissionId || a.id || idx}`,
            title: "Admission Desk Enrollment",
            desc: `${sName} enrolled in ${cName} (Fee: ₹${fee.toLocaleString()}).`,
            time: `${(idx + 1) * 5} mins ago`,
            read: false,
          });
        });
      }

      // 3. Real-time Payments Processed
      if (payRes && payRes.data) {
        const pays = Array.isArray(payRes.data) ? payRes.data : payRes.data.data || [];
        pays.slice(-2).reverse().forEach((p, idx) => {
          notifList.push({
            id: `pay-${p.id || idx}`,
            title: "Fee Receipt Processed",
            desc: `${p.studentName || "Student"} paid ₹${Number(p.amount || 0).toLocaleString()} via ${p.method || p.paymentMode || "UPI"}.`,
            time: `${(idx + 1) * 12} mins ago`,
            read: false,
          });
        });
      }

      setNotifications((prev) => {
        // Retain read status for existing notifications
        const readMap = new Map(prev.map((item) => [item.id, item.read]));
        const merged = notifList.map((item) => ({
          ...item,
          read: readMap.has(item.id) ? readMap.get(item.id) : false,
        }));
        const unreadCount = merged.filter((item) => !item.read).length;
        setUnreadNotifications(unreadCount);
        return merged;
      });
    } catch (err) {
      // Quietly handle notification loading errors
    }
  };

  useEffect(() => {
    loadLiveNotifications();
  }, []);

  const handleMarkAllRead = (e) => {
    e.stopPropagation();
    setUnreadNotifications(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setOpenNotif(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedIn");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 bg-[#faf9f5]/95 backdrop-blur-md border-b border-[#e6dfd8] h-16 px-4 md:px-8 flex items-center justify-between transition-all duration-200">
      {/* Left: Mobile Toggle */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="md:hidden h-9 w-9 rounded-md bg-[#efe9de] flex items-center justify-center text-[#141413] hover:bg-[#cc785c] hover:text-white transition active:scale-95"
        >
          <Menu className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* Right: Quick actions, notifications, user menu */}
      <div className="flex items-center gap-3">
        {/* Active Status Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#cc785c] text-white font-medium text-xs">
          <Sparkles className="h-3.5 w-3.5 fill-current text-white" />
          <span>Active Partner CRM</span>
        </div>

        {/* Notifications Dropdown */}
        <DropdownMenu open={openNotif} onOpenChange={setOpenNotif}>
          <DropdownMenuTrigger className="relative h-9 w-9 rounded-md border border-[#e6dfd8] bg-[#faf9f5] hover:bg-[#efe9de] flex items-center justify-center text-[#141413] transition active:scale-95 cursor-pointer">
            <Bell className="h-4 w-4 text-[#141413]" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 h-4.5 w-4.5 rounded-full bg-[#cc785c] text-[9px] font-medium text-white flex items-center justify-center border border-white">
                {unreadNotifications}
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="right" className="w-80 p-0 rounded-xl bg-[#faf9f5] border-[#e6dfd8]">
            <div className="p-4 border-b border-[#252320] bg-[#181715] text-[#faf9f5] rounded-t-xl flex items-center justify-between">
              <h4 className="font-serif-display font-normal text-base tracking-tight flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-[#cc785c]" /> Notifications
              </h4>
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs font-bold text-[#cc785c] hover:underline cursor-pointer bg-transparent border-none"
              >
                Mark read
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto divide-y divide-[#e6dfd8] text-xs">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#8e8b82]">No new notifications</div>
              ) : (
                notifications.map((n, idx) => (
                  <div
                    key={n.id || idx}
                    className={`p-3.5 transition flex items-start gap-3 ${
                      n.read ? "bg-[#faf9f5] opacity-75" : "bg-[#efe9de]/50 hover:bg-[#efe9de]"
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 font-medium ${
                      n.read ? "bg-[#8e8b82] text-white" : "bg-[#cc785c] text-white"
                    }`}>
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-[#141413]">{n.title}</p>
                        {!n.read && (
                          <span className="h-2 w-2 rounded-full bg-[#cc785c] inline-block shrink-0"></span>
                        )}
                      </div>
                      <p className="text-[#6c6a64] mt-0.5">{n.desc}</p>
                      <span className="text-[10px] text-[#8e8b82] mt-1 inline-block font-medium">{n.time}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile Dropdown */}
        {(() => {
          const userRole = localStorage.getItem("userRole") || "ROLE_ADMIN";
          const userName = localStorage.getItem("userName") || "System User";
          const displayRole = userRole === "ROLE_ADMIN" ? "System Admin" : "Counsellor Desk";
          const initials = userName.substring(0, 2).toUpperCase();

          return (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2.5 pl-2 pr-3 py-1 rounded-md border border-[#e6dfd8] hover:bg-[#efe9de] transition active:scale-95 cursor-pointer bg-[#faf9f5]">
                <Avatar className="h-8 w-8 ring-1 ring-[#cc785c] bg-[#efe9de]">
                  <AvatarImage src={`https://api.dicebear.com/10.x/glyphs/svg?seed=${userName}`} alt={userName} />
                  <AvatarFallback className="bg-[#cc785c] text-white font-medium text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-medium text-[#141413] leading-tight">{userName}</p>
                  <p className="text-[10px] font-bold text-[#cc785c] uppercase">{displayRole}</p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-[#6c6a64]" />
              </DropdownMenuTrigger>

              <DropdownMenuContent align="right" className="w-52 rounded-xl bg-[#faf9f5] border-[#e6dfd8]">
                <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                  <User className="h-4 w-4 mr-2 text-[#cc785c]" />
                  <span className="font-medium">My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/reports")}>
                  <Settings className="h-4 w-4 mr-2 text-[#cc785c]" />
                  <span className="font-medium">CRM Reports</span>
                </DropdownMenuItem>
                <div className="my-1 border-t border-[#e6dfd8]" />
                <DropdownMenuItem onClick={handleLogout} destructive>
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="font-medium">Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        })()}
      </div>
    </header>
  );
}

export default Navbar;