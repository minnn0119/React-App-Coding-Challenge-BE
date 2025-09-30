# Classroom Management App

A web application that allows **Instructors** to manage students, assign lessons, and chat in real time.  
**Students** can view assigned lessons, edit their profiles, and communicate with instructors.

---

## Getting Started

### 1. Backend
```
cd backend
npm install
npm run dev   # run with nodemon
# or
npm start     # run with node
Backend runs at: http://localhost:4000
```
### 2. Frontend
```
cd my-app
npm install
npm run dev   # start react-scripts
Frontend runs at: http://localhost:3000
```
### 3. Demo Accounts
#### Instructor: login with a phone number assigned with role instructor.
#### Student: login with a phone number assigned with role student.
### 4. Features
#### - Instructor
##### + Add / edit / delete students
##### + Assign lessons to students
##### + Chat in real time with students
#### - Student
##### + View assigned lessons
##### + Edit personal information
##### + Chat in real time with instructor
#### - General
##### + Authentication with JWT + Firebase
##### + Realtime chat with Socket.io
##### + UI built with React + Bootstrap 5
### 5. Notes
##### Backend and frontend run independently → start both
##### serviceAccountKey.json in backend/ contains Firebase credentials (not public)
##### Update the API base URL in my-app/src/api/api.js when deploying
### 6. License
##### MIT License
