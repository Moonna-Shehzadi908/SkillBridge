# SkillBridge — Smart Skill & Career Development Platform

SkillBridge is a full-stack web application designed to help learners discover and develop relevant skills, access personalized learning resources, and explore suitable career opportunities based on their skills and learning goals.

The platform provides a structured learning experience through skill management, personalized recommendations, learning resources, career exploration, user authentication, and learner profiles.

---

## 🚀 Project Overview

SkillBridge aims to bridge the gap between learning and career development by providing learners with a centralized platform where they can:

* Create and manage their user profile
* Explore available skills
* Add skills to their personal skill profile
* Remove selected skills
* Receive personalized skill recommendations
* Discover relevant learning resources
* Receive recommended learning resources based on selected skills
* Explore relevant career paths
* View required skills and career information
* Identify career demand levels
* View career matching and recommendation scores
* Access career and learning resources through external links

The project is being developed as part of the **Full-Stack Web Development Internship at Zynvex Solutions**.

---

## 🛠️ Technology Stack

### Frontend

* React.js
* TypeScript
* Tailwind CSS
* React Router
* Vite
* Lucide React

### Backend

* Django
* Django REST Framework
* Python

### Database

* PostgreSQL

### Authentication

* JWT (JSON Web Tokens)
* Bearer Token Authentication

### Development Tools

* Git
* GitHub
* VS Code
* ESLint

---

# 📦 Module 1 — Project Setup, Authentication & User Profiles

Module 1 established the core foundation of SkillBridge, including project setup, authentication, user profile functionality, and the initial interfaces for skills, learning resources, and career exploration.

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

### 4. Initial Skills Management

SkillBridge provides a dedicated skill-management experience where users can:

* View available skills.
* View their selected skills.
* Add skills to their profile.
* Remove skills from their profile.
* View skill categories and descriptions.
* Track available and selected skills.

### 5. Initial Learning Resources

* Implemented the initial Resources page.
* Created the foundation for displaying learning materials.
* Connected the frontend resource interface with backend functionality.

### 6. Initial Career Exploration

A dedicated Career page was implemented where users can:

* Explore available career paths.
* View career descriptions.
* See required skills.
* View average salary information when available.
* Identify career demand levels.
* Open external career resources through provided links.

---

# 🤖 Module 2 — Dynamic Skills, Smart Recommendations & Career Matching

Module 2 focuses on transforming SkillBridge from a primarily interface-based platform into a more **dynamic and personalized learning and career experience**.

The major functionality introduced in this module includes dynamic backend integration, personalized skill recommendations, recommended learning resources, and AI-style career matching based on user skills.

## ✅ Module 2 Completed Work

### 1. Dynamic Skills Management

The Skills module was connected with the backend APIs to provide real-time user-specific data.

Users can now:

* Fetch available skills dynamically from the backend.
* View their currently selected skills.
* Add skills to their profile.
* Remove skills from their profile.
* Receive personalized skill recommendations.
* View recommended skills based on their existing skill profile.
* See dynamic skill statistics.
* Handle loading, error, and authentication states.

### 2. Smart Skill Recommendations

A recommendation system was added to suggest additional skills based on the user's existing skill profile.

The recommendation experience includes:

* Personalized recommended skills.
* Recommendation scoring.
* Skill-based matching.
* Dynamic recommendation data from the backend.
* Clear explanations for recommended skills.

This provides a more personalized experience instead of showing the same static skill suggestions to every learner.

### 3. Dynamic Learning Resources

The Resources module was enhanced with backend-driven learning content.

Users can:

* View available learning resources dynamically.
* Search resources.
* Filter resources by skill.
* Filter resources by resource type.
* Open external learning resources.
* View resource descriptions.
* Identify the related skill for each resource.
* Refresh resource data.

Supported resource types include:

* Articles
* Videos
* Courses
* Documentation

### 4. Personalized Resource Recommendations

A recommendation system was added to the Resources module.

Recommended resources are generated according to the user's selected skills and resource characteristics.

The recommendation system considers factors such as:

* User-selected skills
* Resource descriptions
* Resource type
* Related skill
* Recommendation match score

Each recommendation can also provide a reason explaining why the resource is relevant to the learner.

### 5. AI Career Matching

The Career module was enhanced with personalized career matching functionality.

Career recommendations are generated by comparing the user's skills with the skills required for available career paths.

The matching system includes:

* User skill normalization.
* Required-skill matching.
* Career match scoring.
* Skill-based career recommendations.
* Career demand-based scoring.
* Career ranking.
* Match percentage / score presentation.
* Required skills information.
* Career descriptions.
* Salary information when available.
* External career resources.

Career demand levels are also considered during the matching process to make recommendations more useful for career planning.

### 6. Dynamic API Integration

Module 2 significantly expanded communication between the React frontend and Django REST Framework backend.

Important integrated endpoints include:

```text
/api/skills/
/api/skills/recommendations/
/api/accounts/me/skills/
/api/resources/
/api/resources/recommendations/
/api/career/
```

Authenticated endpoints use JWT Bearer authentication.

Example:

```text
Authorization: Bearer <access_token>
```

### 7. Improved User Experience

The major Module 2 features were integrated while maintaining the existing SkillBridge design system.

Improvements include:

* Dynamic loading states
* Error handling
* Empty states
* Responsive layouts
* Interactive cards
* Recommendation sections
* Match score indicators
* Skill-based filtering
* Professional hover effects
* Light/dark theme compatibility
* Consistent typography and spacing
* Responsive navigation
* Improved visual hierarchy

---

# 🎨 UI & User Experience

The SkillBridge frontend follows a clean, modern, responsive, and professional design approach.

Key UI features include:

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
* Personalized recommendation sections
* Dynamic data presentation

---

# 📁 Project Structure

```text
SkillBridge/
│
├── backend/
│   ├── apps/
│   │   ├── accounts/
│   │   ├── skills/
│   │   ├── resources/
│   │   └── career/
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

### Skills

```text
GET  /api/skills/
GET  /api/skills/recommendations/
GET  /api/accounts/me/skills/
POST /api/accounts/me/skills/
DELETE /api/accounts/me/skills/{skillId}/
```

### Resources

```text
GET /api/resources/
GET /api/resources/recommendations/
```

Resources also support filtering and searching through query parameters.

Examples:

```text
/api/resources/?search=Python
/api/resources/?skill=4
/api/resources/?resource_type=video
```

### Career

```text
GET /api/career/
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

# 📌 Module Status

### Module 1

**Status: Completed ✅**

Module 1 established the project foundation, authentication, user profile functionality, initial skills management, learning resources, and career exploration.

### Module 2

**Status: Completed ✅**

Module 2 introduced dynamic backend-driven functionality, personalized skill recommendations, recommended learning resources, and skill-based career matching.

---

# 👩‍💻 Internship Information

**Program:** Full-Stack Web Development Internship
**Organization:** Zynvex Solutions
**Project:** SkillBridge — Smart Skill & Career Development Platform
**Internship ID:** ZYNVEX-CERT-1066

---

# 🔮 Future Development

Future modules will continue expanding SkillBridge with advanced AI-powered and career-development functionality.

Planned enhancements include:

* AI-powered SkillBridge Chatbot
* Intelligent learning assistance
* Personalized learning guidance
* Advanced career recommendations
* Learning progress tracking
* Skill development tracking
* Personalized learning paths
* Additional AI-powered features
* Enhanced learner analytics

---

## 🌱 Project Vision

SkillBridge is designed to evolve into an intelligent learning and career-development platform that helps learners understand **what to learn, how to learn it, and where those skills can take their careers**.

---

## About

A full-stack skill and career development platform that helps learners discover skills, access personalized learning resources, track their progress, and explore relevant career opportunities.
