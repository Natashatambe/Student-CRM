import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ClipboardList,
  CreditCard,
  FileBarChart,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";

function Sidebar({ collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuSections = [
    {
      title: "Main Management",
      items: [
        {
          name: "Dashboard",
          icon: <LayoutDashboard className="h-4.5 w-4.5 shrink-0" />,
          path: "/dashboard",
        },
        {
          name: "Students",
          icon: <Users className="h-4.5 w-4.5 shrink-0" />,
          path: "/students",
          badge: "148",
        },
        {
          name: "Courses",
          icon: <GraduationCap className="h-4.5 w-4.5 shrink-0" />,
          path: "/courses",
        },
        {
          name: "Admissions",
          icon: <ClipboardList className="h-4.5 w-4.5 shrink-0" />,
          path: "/admissions",
          badge: "NEW",
          badgeVariant: "coral",
        },
      ],
    },
    {
      title: "Finance & Insights",
      items: [
        {
          name: "Payments",
          icon: <CreditCard className="h-4.5 w-4.5 shrink-0" />,
          path: "/payments",
          badge: "★ Dues",
        },
        {
          name: "Reports",
          icon: <FileBarChart className="h-4.5 w-4.5 shrink-0" />,
          path: "/reports",
        },
      ],
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedIn");
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 md:hidden transition-opacity"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* Main Sidebar Aside (Dark Navy Product Surface) */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-[#181715] text-[#faf9f5] shadow-xl z-40 flex flex-col transition-all duration-300 ease-in-out border-r border-[#252320] overflow-hidden ${
          collapsed ? "w-16" : "w-52"
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-3 border-b border-[#252320] shrink-0 overflow-hidden">
          {!collapsed ? (
            <div
              className="flex items-center gap-2 cursor-pointer group overflow-hidden"
              onClick={() => navigate("/dashboard")}
            >
              <div className="h-8.5 w-8.5 rounded-md bg-[#cc785c] flex items-center justify-center text-white font-serif-display font-bold text-lg shadow-md group-hover:bg-[#a9583e] transition-colors shrink-0">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div className="overflow-hidden">
                <h1 className="text-sm font-semibold font-serif-display text-[#faf9f5] tracking-tight leading-none whitespace-nowrap">
                  Student Admission <span className="text-[#cc785c] text-[10px] font-sans font-bold">CRM</span>
                </h1>
                <p className="text-[9px] font-medium text-[#a09d96] mt-0.5 tracking-wider uppercase whitespace-nowrap">
                  Admission Desk
                </p>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setCollapsed(false)}
              className="mx-auto h-8.5 w-8.5 rounded-md bg-[#cc785c] hover:bg-[#a9583e] flex items-center justify-center text-white shadow-md transition active:scale-95 cursor-pointer shrink-0"
              title="Expand Sidebar"
            >
              <GraduationCap className="h-5 w-5" />
            </button>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`h-7 w-7 rounded-md bg-[#252320] hover:bg-[#322f2b] text-[#a09d96] hover:text-[#faf9f5] flex items-center justify-center transition active:scale-95 cursor-pointer shrink-0 ${
              collapsed ? "hidden" : "flex"
            }`}
            title={collapsed ? "Expand Navigation" : "Collapse Navigation"}
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 py-3 px-2 space-y-4 overflow-y-auto overflow-x-hidden sidebar-scroll">
          {menuSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!collapsed ? (
                <p className="px-3 text-[9px] font-medium uppercase tracking-widest text-[#a09d96] mb-1.5 whitespace-nowrap truncate">
                  {section.title}
                </p>
              ) : (
                <div className="h-px bg-[#252320] my-2 mx-1" />
              )}

              {section.items.map((item) => {
                const isActive = location.pathname === item.path;

                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    title={collapsed ? item.name : undefined}
                    className={() =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-md font-medium text-xs transition-all duration-200 group relative ${
                        isActive
                          ? "bg-[#cc785c] text-white shadow-sm font-semibold"
                          : "hover:bg-[#252320] text-[#a09d96] hover:text-[#faf9f5]"
                      } ${collapsed ? "justify-center px-0" : ""}`
                    }
                  >
                    <span className={`transition-transform duration-200 ${isActive ? "scale-105 text-white" : "group-hover:scale-105"}`}>
                      {item.icon}
                    </span>

                    {!collapsed && (
                      <span className="truncate font-medium tracking-tight text-xs">
                        {item.name}
                      </span>
                    )}

                    {/* Item Badges */}
                    {!collapsed && item.badge && (
                      <span
                        className={`ml-auto px-1.5 py-0.5 rounded-full text-[9px] font-medium shrink-0 ${
                          item.badgeVariant === "coral"
                            ? "bg-[#cc785c] text-white"
                            : "bg-[#252320] text-[#a09d96] border border-[#322f2b]"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer Admin Summary with DiceBear Glyphs Avatar */}
        <div className="p-3 border-t border-[#252320] bg-[#1f1e1b] shrink-0 overflow-hidden">
          {!collapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <Avatar className="h-8.5 w-8.5 ring-1 ring-[#cc785c]/40 shrink-0 bg-[#252320]">
                  <AvatarImage src="https://api.dicebear.com/10.x/glyphs/svg?seed=SeniorAdminCRM" alt="Senior Admin" />
                  <AvatarFallback className="bg-[#cc785c] text-white font-medium text-[11px]">
                    SA
                  </AvatarFallback>
                </Avatar>
                <div className="truncate">
                  <p className="text-[11px] font-medium text-[#faf9f5] truncate flex items-center gap-1">
                    Senior Admin <Sparkles className="h-2.5 w-2.5 text-[#cc785c] fill-current shrink-0" />
                  </p>
                  <p className="text-[9px] text-[#a09d96] truncate">Admission Portal</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="h-7 w-7 rounded-md text-[#a09d96] hover:text-red-400 hover:bg-[#252320] flex items-center justify-center transition active:scale-95 shrink-0 cursor-pointer"
                title="Logout"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full h-8 rounded-md text-[#a09d96] hover:text-red-400 hover:bg-[#252320] flex items-center justify-center transition active:scale-95 cursor-pointer shrink-0"
              title="Logout"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;