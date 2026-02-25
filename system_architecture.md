# System Architecture - College 360

## 🏗️ Architectural Overview

The College Management Portal is built on a **Client-Server Architecture** designed for high responsiveness, modern aesthetics, and automated campus utility. It follows a modular design pattern, separating presentation logic from data management and security services.

---

## 💻 Technology Stack

### Frontend (Client Layer)

- **Framework**: React.js (Vite)
- **Styling**: Vanilla CSS with **Glassmorphism** design language.
- **Charts & Visualization**: `recharts` for attendance tracking.
- **Icons**: `lucide-react` for a premium UI feel.
- **Imaging**: `react-webcam` for facial recognition workflows.
- **State Management**: React Context API (`AuthContext`) for user session persistence.
- **API Client**: `axios` with interceptor-ready configuration.

### Backend (Server Layer)

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite 3 (Persistent, local file-based storage).
- **File Handling**: `multer` for student resource uploads.
- **Security**: Role-Based Access Control (RBAC) middleware.

---

## 🔒 Specialized Security Modules

### 1. AI-Powered Attendance & Geofencing

A dual-factor verification system for marking presence:

- **Geofencing**: Uses browser Geolocation APIs and the Haversine formula to restrict attendance marking to a 100m radius of classroom coordinates (`16.838936, 82.225061`).
- **Identity Verification**: Simulated AI Facial Recognition via live webcam feed to ensure the physical presence of the student.
- **Instant Processing**: Automated verification logic that removes the need for manual administrative review.

### 2. Role-Based Access Control (RBAC)

- **Student Role**: Access to personal dashboards, resource downloads, attendance marking, and complaint filing.
- **Admin Role**: Access to master audit logs, student management, campus-wide statistics, and event scheduling.

---

## 📊 Data Schema (SQLite)

### `users`

Tracks student and staff identity, login credentials, and assigned roles.

### `attendance`

Stores verified presence logs including:

- `userId` (Foreign Key)
- `date` (ISO Format)
- `verified` (Boolean/Integer)
- `method` (AI/Geofencing)

### `resources`

Management system for academic materials, storing file metadata and upload timestamps.

### `complaints` & `feedback`

Anonymous and attributed channels for campus communication and faculty evaluation.

---

## 📁 Project Structure

```text
college-management-portal/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── context/        # Authentication & State
│   │   ├── pages/          # Dashboard, Attendance, Resources, etc.
│   │   ├── components/     # High-level UI elements
│   │   └── App.jsx         # Routing & Layout
├── server/                 # Express Backend
│   ├── uploads/            # Student resource storage
│   ├── database.sqlite     # Persistent data file
│   └── index.js            # API Endpoints & DB Logic
└── system_architecture.md  # System Documentation
```

---

## 🚀 Key Workflows

1. **Attendance Marking**: Geolocation Check → Webcam AI Recognition → Instant DB Commit.
2. **Resource Sharing**: Faculty Upload → File Storage → Public/Restricted Student Access.
3. **Analytics**: DB aggregation → Admin Statistical API → Recharts Visualization.
