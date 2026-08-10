import { useState } from "react";
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

function Navbar({ collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const [unreadNotifications, setUnreadNotifications] = useState(3);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedIn");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 bg-[#faf9f5]/95 backdrop-blur-md border-b border-[#e6dfd8] h-16 px-4 md:px-8 flex items-center justify-between transition-all duration-200">
      {/* Left: Mobile Toggle & Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="md:hidden h-9 w-9 rounded-md bg-[#efe9de] flex items-center justify-center text-[#141413] hover:bg-[#cc785c] hover:text-white transition active:scale-95"
        >
          <Menu className="h-4.5 w-4.5" />
        </button>

        <div className="relative w-full hidden sm:block">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#6c6a64]" />
          <Input
            type="text"
            placeholder="Search students, courses, admissions..."
            className="pl-10 rounded-md bg-[#efe9de] border-[#e6dfd8] focus:bg-[#faf9f5] text-xs md:text-sm font-normal h-9"
          />
        </div>
      </div>

      {/* Right: Quick actions, notifications, user menu */}
      <div className="flex items-center gap-3">
        {/* Active Status Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#cc785c] text-white font-medium text-xs">
          <Sparkles className="h-3.5 w-3.5 fill-current text-white" />
          <span>Active Partner CRM</span>
        </div>

        {/* Notifications Dropdown */}
        <DropdownMenu>
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
                onClick={() => setUnreadNotifications(0)}
                className="text-xs font-medium text-[#cc785c] hover:underline"
              >
                Mark read
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto divide-y divide-[#e6dfd8] text-xs">
              <div className="p-3.5 hover:bg-[#efe9de] transition flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-[#cc785c] text-white flex items-center justify-center shrink-0 mt-0.5 font-medium">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-[#141413]">New Student Admission</p>
                  <p className="text-[#6c6a64] mt-0.5">Natasha Tambe registered for Java Full Stack.</p>
                  <span className="text-[10px] text-[#8e8b82] mt-1 inline-block font-medium">10 mins ago</span>
                </div>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile Dropdown with DiceBear Glyphs Avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2.5 pl-2 pr-3 py-1 rounded-md border border-[#e6dfd8] hover:bg-[#efe9de] transition active:scale-95 cursor-pointer bg-[#faf9f5]">
            <Avatar className="h-8 w-8 ring-1 ring-[#cc785c] bg-[#efe9de]">
              <AvatarImage src="https://api.dicebear.com/10.x/glyphs/svg?seed=SeniorAdminCRM" alt="Senior Admin" />
              <AvatarFallback className="bg-[#cc785c] text-white font-medium text-xs">
                SA
              </AvatarFallback>
            </Avatar>
            <div className="text-left hidden lg:block">
              <p className="text-xs font-medium text-[#141413] leading-tight">Admission Admin</p>
              <p className="text-[10px] font-medium text-[#cc785c]">Portal Manager</p>
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
              <span className="font-medium">CRM Settings</span>
            </DropdownMenuItem>
            <div className="my-1 border-t border-[#e6dfd8]" />
            <DropdownMenuItem onClick={handleLogout} destructive>
              <LogOut className="h-4 w-4 mr-2" />
              <span className="font-medium">Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default Navbar;