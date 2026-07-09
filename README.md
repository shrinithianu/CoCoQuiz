#  CoCoQuiz — Online Examination Platform

A full-stack online examination platform with three roles: **Student**, **Teacher**, and **Admin**. Built with React.js frontend and Python Flask backend with MySQL database.

---

## Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Frontend | React.js, React Router v6, Axios        |
| Backend  | Python, Flask, Flask-JWT-Extended       |
| Database | MySQL 8.0                               |
| Auth     | JWT (JSON Web Tokens) + Bcrypt          |
| Styling  | Custom CSS, Google Fonts (Inter, Space Grotesk) |

---

## User Roles

| Role | Icon | What they can do |
|------|------|-----------------|
| **Student** | 🎓 | Take quizzes, view scores, review answers |
| **Teacher** | 👨‍🏫 | Create/delete quizzes, add questions, set participant limits, view student scores |
| **Admin** | 👑 | Full visibility — all users, quizzes, results, and platform statistics |

---

## Project Structure

```
CoCoQuiz/
├── backend/
│   ├── app.py                    # Flask app entry point
│   ├── config.py                 # Configuration (DB, JWT secrets)
│   ├── requirements.txt          # Python dependencies
│   ├── database/
│   │   └── db.py                 # MySQL connection + auto table creation
│   ├── models/
│   │   ├── user_model.py         # User CRUD operations
│   │   ├── quiz_model.py         # Quiz + Question CRUD
│   │   └── result_model.py       # Result + Answer CRUD
│   ├── routes/
│   │   ├── auth_routes.py        # /auth — register, login, me
│   │   ├── quiz_routes.py        # /quiz — list, create, delete, questions
│   │   ├── result_routes.py      # /results — submit, my results, detail
│   │   └── admin_routes.py       # /admin — users, quizzes, results, stats
│   └── utils/
│       └── jwt_helper.py         # get_current_user(), role helpers
│
└── frontend/cocoquiz-frontend/
    ├── public/
    │   └── index.html
    ├── package.json
    └── src/
        ├── App.js                # Router with role-based protected routes
        ├── index.js
        ├── components/
        │   ├── Navbar.js         # Top navigation with role badge
        │   ├── Timer.js          # Live countdown timer
        │   └── QuestionCard.js   # MCQ question with A/B/C/D options
        ├── pages/
        │   ├── Login.js          # Sign in page
        │   ├── Register.js       # Register with role selector
        │   ├── StudentDashboard.js  # Browse quizzes + view scores
        │   ├── TeacherDashboard.js  # Manage quizzes + view student scores
        │   ├── AdminDashboard.js    # Full platform overview
        │   ├── Quiz.js           # Exam page with timer
        │   └── Results.js        # Result history + answer review
        ├── services/
        │   ├── authService.js    # Auth API + localStorage helpers
        │   ├── quizService.js    # Quiz API calls
        │   └── resultService.js  # Result + Admin API calls
        └── styles/
            ├── App.css           # Global design system
            ├── Login.css         # Auth + role selector styles
            └── Quiz.css          # Exam page styles
```

---

## Prerequisites

Make sure you have these installed before starting:

- **Python 3.13+** — [python.org/downloads](https://www.python.org/downloads/)
- **Node.js 18+** — [nodejs.org](https://nodejs.org/)
- **MySQL 8.0+** — [mysql.com](https://dev.mysql.com/downloads/)

---

## Setup & Run

### Step 1 — Configure Database Password

Open `backend/config.py` and set your MySQL root password:

```python
MYSQL_PASSWORD = os.environ.get("MYSQL_PASSWORD") or "your_mysql_password"
```

---

### Step 2 — Run the Backend

Open a terminal and run:

```bash
cd D:\CoCoQuiz\backend
py -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
py app.py
```

You should see:
```
Database initialized successfully.
 * Running on http://127.0.0.1:5000
```

> The database and all tables are created automatically on first run.

---

### Step 3 — Run the Frontend

Open a **second terminal** (keep the backend running!) and run:

```bash
cd D:\CoCoQuiz\frontend\cocoquiz-frontend
npm install
npm start
```

The app will open at **http://localhost:3000**

---

## How to Use

### Register
Go to **http://localhost:3000/register**

Choose your role by clicking one of the cards:
- 🎓 **Student** — to take quizzes
- 👨‍🏫 **Teacher** — to create and manage quizzes
- 👑 **Admin** — to monitor all platform activity

---

### As a Student 🎓
1. Login and browse available quizzes on the Dashboard
2. Click **"Start Quiz"** to begin a timed exam
3. Answer questions and click **"Submit Quiz"**
4. View your score and detailed answer review instantly
5. Click **"My Results"** to see your exam history

---

### As a Teacher 👨‍🏫
1. Login and go to the **Teacher Panel**
2. Click **"+ Create Quiz"** to create a new quiz
   - Set title, description, duration, and optional participant limit
3. Click **"Manage →"** on a quiz to:
   - Add/delete questions with 4 options and correct answer
   - View all student scores in a table
4. Delete quizzes you no longer need

---

### As an Admin 👑
1. Login and view the **Admin Dashboard**
2. Switch between tabs:
   - ** Overview** — Platform stats + recent activity feed
   - ** Users** — All registered users with roles
   - ** Quizzes** — All quizzes with teacher names
   - ** All Results** — Every student submission across all quizzes

---

## API Reference

All protected endpoints require:
```
Authorization: Bearer <jwt_token>
```

### Auth — `/auth`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | No | Register with role (student/teacher/admin) |
| POST | `/login` | No | Login, returns JWT token |
| GET | `/me` | JWT | Get current user info |

### Quizzes — `/quiz`
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/` | Any | List quizzes (teachers see only theirs) |
| GET | `/:id` | Any | Get quiz details |
| GET | `/:id/questions` | Any | Get questions (answers hidden for students) |
| POST | `/` | Teacher/Admin | Create a quiz |
| DELETE | `/:id` | Teacher/Admin | Delete a quiz |
| POST | `/:id/questions` | Teacher/Admin | Add a question |
| DELETE | `/questions/:id` | Teacher/Admin | Delete a question |
| GET | `/:id/participants` | Teacher/Admin | Get student scores for a quiz |

### Results — `/results`
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/submit` | Student | Submit quiz answers, get instant score |
| GET | `/my` | Student | Get my result history |
| GET | `/:id` | Student | Get detailed result with answer review |

### Admin — `/admin`
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/stats` | Admin | Platform statistics |
| GET | `/users` | Admin | All users |
| GET | `/quizzes` | Admin | All quizzes |
| GET | `/results` | Admin | All results |

---

## Database Schema

```
users           — id, username, email, password, role, created_at
quizzes         — id, title, description, duration_minutes, max_participants, created_by, created_at
questions       — id, quiz_id, question_text, option_a/b/c/d, correct_option, marks
results         — id, user_id, quiz_id, score, total_marks, percentage, time_taken_seconds, submitted_at
answers         — id, result_id, question_id, selected_option, is_correct
```

---

## Security

- Passwords hashed with **bcrypt**
- All routes protected with **JWT tokens**
- Students cannot see `correct_option` — stripped from responses
- Teachers can only delete **their own** quizzes
- Admin-only endpoints return **403** for other roles
- Participant limits enforced server-side

---

## Features at a Glance

-  Role-based registration (Student / Teacher / Admin)
-  Role-based dashboards with different views
-  Teacher can set max participant limit per quiz
-  Live countdown timer with urgent animation
-  Question navigator sidebar (answered = green)
-  Instant score calculation on submission
-  Detailed answer review with correct/wrong highlights
-  Admin overview with stats and activity feed
-  Fully responsive — works on mobile and desktop
-  Color-coded grades: Excellent / Good / Average / Needs Work

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `Access denied for user 'root'` | Update password in `backend/config.py` |
| `Failed to create quiz` | Make sure backend is running on port 5000 |
| Frontend shows blank page | Run `npm start` instead of opening `index.html` directly |
| `py` not recognized | Install Python 3.13 from python.org and check "Add to PATH" |
| Teacher registration fails | Run `ALTER TABLE users MODIFY COLUMN role ENUM('student','teacher','admin')` in MySQL |
| Quiz table error | Run `ALTER TABLE quizzes ADD COLUMN max_participants INT DEFAULT NULL` in MySQL |

---

## Developer

**ShriNithi Anu**  
Full Stack Developer  
B.Sc. Computer Science — 2026  
shrinithianu@gmail.com

---

*Built with React.js · Flask · MySQL*
