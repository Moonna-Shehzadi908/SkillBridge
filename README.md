# SkillBridge — Smart Skill & Career Development Platform

SkillBridge is a full-stack web application designed to help learners discover and develop relevant skills, access learning resources, and explore career opportunities based on their interests and learning goals.

The platform provides a structured learning experience through skill management, learning resources, career exploration, user authentication, and personalized user profiles.

---

## 🚀 Project Overview

SkillBridge aims to bridge the gap between learning and career development by providing learners with a centralized platform where they can:

* Create and manage their user profile
* Explore available skills
* Add skills to their personal skill profile
* Remove selected skills
* Discover learning resources
* Explore relevant career paths
* View required skills and career information
* Access career resources through external links

The project is being developed as part of the **Full-Stack Web Development Internship at Zynvex Solutions**.

---

## 🛠️ Technology Stack

### Frontend

* React.js
* TypeScript
* Tailwind CSS
* React Router
* Vite

### Backend

* Django
* Django REST Framework
* Python

### Database

* PostgreSQL

### Authentication

* JWT (JSON Web Tokens)

### Development Tools

* Git
* GitHub
* VS Code
* ESLint

---

# 📦 Module 1 — Project Setup, Authentication & User Profiles

Module 1 focuses on establishing the core foundation of SkillBridge, including the project structure, authentication, user profile functionality, skill management, learning resources, and career exploration interfaces.

## ✅ Module 1 Completed Work

### 1. Project Setup

* Created the Django backend project.
* Configured the backend application structure.
* Created the accounts application.
* Configured the development environment.
* Set up the React + TypeScript frontend.
* Configured Tailwind CSS for responsive UI development.
* Added project-level `.gitignore`.
* Organized frontend and backend inside the main repository.

### 2. Authentication

* Implemented JWT-based authentication.
* Protected authenticated API requests using Bearer tokens.
* Added unauthorized-session handling.
* Redirected unauthenticated users to the login page.
* Configured access and refresh token handling on the frontend.

### 3. User Profile Foundation

* Integrated authenticated user functionality.
* Connected frontend pages with backend APIs.
* Established the foundation for personalized learner profiles.

### 4. Skills Management

SkillBridge provides a dedicated skill-management experience where users can:

* View all available skills.
* View their selected skills.
* Add skills to their profile.
* Remove skills from their profile.
* See skill categories and descriptions.
* Track the number of available and selected skills.

The Skills page was also improved with a responsive and professional user interface.

### 5. Learning Resources

The Resources page was enhanced to provide learners with a cleaner and more professional interface for discovering learning materials.

### 6. Career Exploration

A dedicated Career page was implemented where users can:

* Explore available career paths.
* View career descriptions.
* See required skills.
* View average salary information when available.
* Identify career demand levels.
* Open external career resources through provided links.

The Career page UI was also improved as part of the Module 1 completion work.

---

# 🎨 UI & User Experience

The frontend follows a clean, modern, and responsive design approach.

Key UI improvements include:

* Responsive layouts for different screen sizes
* Professional card-based interfaces
* Consistent SkillBridge branding
* Light/dark theme support
* Interactive hover states
* Loading states
* Error and success messages
* Accessible buttons and navigation
* Responsive navigation
* Consistent spacing, typography, borders, and shadows

---

# 📁 Project Structure

```text
SkillBridge/
│
├── backend/
│   ├── apps/
│   │   └── accounts/
│   ├── config/
│   ├── manage.py
│   └── ...
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── assets/
│   │   └── ...
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
```

---

# 🔐 API Integration

The React frontend communicates with the Django REST Framework backend through REST APIs.

Examples of integrated functionality include:

```text
/api/skills/
/api/accounts/me/skills/
/api/career/
```

Authenticated requests use JWT Bearer authentication.

Example:

```text
Authorization: Bearer <access_token>
```

---

# ⚙️ Local Setup

## 1. Clone the Repository

```bash
git clone https://github.com/Moonna-Shehzadi908/SkillBridge.git
cd SkillBridge
```

---

## 2. Backend Setup

Navigate to the backend:

```bash
cd backend
```

Create and activate a virtual environment:

### Windows

```bash
python -m venv .venv
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run migrations:

```bash
python manage.py migrate
```

Start the Django development server:

```bash
python manage.py runserver
```

Backend will run at:

```text
http://127.0.0.1:8000/
```

---

## 3. Frontend Setup

Open another terminal and navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will then be available through the Vite development URL shown in the terminal.

---

# 🔗 Repository

**GitHub Repository:**
https://github.com/Moonna-Shehzadi908/SkillBridge

---

# 📌 Module 1 Status

**Status: Completed ✅**

Module 1 includes the initial project setup, authentication foundation, user profile foundation, skill management, learning resources interface, and career exploration functionality.

---

# 👩‍💻 Internship Information

**Program:** Full-Stack Web Development Internship
**Organization:** Zynvex Solutions
**Project:** SkillBridge — Smart Skill & Career Development Platform
**Internship ID:** ZYNVEX-CERT-1066

---

## 🌱 Future Development

Future modules will continue expanding SkillBridge with additional learning, progress-tracking, and career-development functionality.
