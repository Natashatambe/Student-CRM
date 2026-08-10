# 🎓 Student Admission CRM • Management Edition

A flagship, warm editorial **Student Admission & Course Management System** built with **React**, **Vite**, **Tailwind CSS**, and **Express REST API**.

Designed around a warm editorial aesthetic — featuring tinted cream canvas (`#faf9f5`), signature warm coral accents (`#cc785c`), Cormorant Garamond slab-serif display headlines, dark navy product chrome (`#181715`), and dynamic DiceBear Glyphs random avatars.

---

## ✨ Key Features

- 📊 **Admission Intelligence Dashboard**: Real-time metrics for total students, active batches, admissions count, and revenue performance with interactive Recharts analytics.
- 👥 **Student Partner Directory**: Comprehensive student record management (first name, last name, phone, email, address, gender, course track, and enrollment status) with dynamic DiceBear Glyphs avatars.
- 📚 **Course Curriculum Catalog**: Manage course offerings, durations (e.g. 6 months), fee structures, and batch status (`Active` / `Inactive`).
- 📋 **Admissions Desk**: Register student enrollments, link student & course IDs, track admission dates, and manage fee payment statuses (`Paid`, `Pending`, `Partial`).
- 💳 **Payment & Finance Desk**: Record fee receipts, track pending dues, calculate collection totals, and export financial summaries.
- 🖼️ **Editorial Modal & UI Components**: Custom dialogs, sticky headers, responsive navigation drawers, pill badges, and scroll-free dark navy login portal.

---

## 🎨 Design System Specifications

| Token / Asset | Hex Code / Specification | Description |
| :--- | :--- | :--- |
| **Canvas Floor** | `#faf9f5` | Warm Tinted Cream Canvas |
| **Ink Text** | `#141413` | Warm Dark Ink Body Text |
| **Primary Accent** | `#cc785c` | Signature Warm Coral Accent |
| **Active CTA Hover** | `#a9583e` | Darkened Coral Press State |
| **Surface Card** | `#efe9de` | Light Cream Content Card |
| **Product Surface** | `#181715` | Dark Navy Chrome (Sidebar, Code, Header) |
| **Hairline Border** | `#e6dfd8` | Subtle Hairline Divider |
| **Display Font** | `Cormorant Garamond` | Slab-Serif Display Headline Font |
| **Body Font** | `Inter` | Humanist Sans Body & Control Font |
| **Avatars API** | `DiceBear Glyphs` | `https://api.dicebear.com/10.x/glyphs/svg` |

---

## 🚀 Technology Stack

### Frontend
- **Framework**: React 18 + Vite 8
- **Styling**: Tailwind CSS + Custom CSS Variables
- **Icons**: Lucide React (`lucide-react`)
- **UI Primitives**: Radix / Shadcn Primitives (Dialog, DropdownMenu, Avatar, Badge, Tabs, Toast)
- **Charts**: Recharts (`recharts`)
- **Avatar API**: DiceBear Glyphs API (`10.x`)

### Backend
- **REST Server**: Express.js REST API Server (`server.js` running on `http://localhost:8080`)
- **Backend Schema**: Fully compatible with Java Spring Boot REST Controllers (`/api/students`, `/api/courses`, `/api/admissions`, `/api/payments`)

---

## 💻 Quick Start & Installation

```bash
# 1. Clone the Repository
git clone https://github.com/Natashatambe/Student-CRM.git
cd Student-CRM/frontend

# 2. Install Dependencies
npm install

# 3. Launch Development Server
npm run dev

# 4. Production Build Verification
npm run build
```

---

## 🔒 Demo Admin Credentials

- **Username**: `admin`
- **Password**: `admin123`

---

## 📁 Repository Structure

```
StudentAdmissionCRM/
├── backend/
│   └── server.js               # Express REST API Server (Port 8080)
└── frontend/
    ├── public/
    │   └── favicon.svg         # Anthropic 4-spoke radial asterisk mark SVG
    ├── src/
    │   ├── Components/
    │   │   ├── admissions/     # AdmissionTable, AddAdmissionDialog, etc.
    │   │   ├── courses/        # CourseTable, AddCourseDialog, etc.
    │   │   ├── dashboard/      # DashboardHeader, Cards, Charts, RecentActivity
    │   │   ├── layout/         # Sidebar, Navbar, Layout
    │   │   ├── students/       # StudentTable, AddStudentDialog, etc.
    │   │   └── ui/             # Button, Card, Dialog, Input, Badge, Avatar, Toast
    │   ├── pages/              # Dashboard, Students, Courses, Admissions, Payments, Login
    │   ├── services/           # Axios API services (studentService, courseService, etc.)
    │   ├── index.css           # Global Warm Editorial Theme Variables
    │   └── main.jsx
    └── package.json
```

---

## 📄 License

Developed for **Student Admission CRM** • Management Edition.
