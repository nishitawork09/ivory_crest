# Ivory Crest Luxury Hotel Booking & Management System

![MERN Stack](https://img.shields.io/badge/MERN-Full%20Stack-green)
![React](https://img.shields.io/badge/React-19-blue)
![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-brightgreen)
![License](https://img.shields.io/badge/License-MIT-yellow)

Ivory Crest is a full-stack hotel booking and management platform built using the MERN Stack (MongoDB, Express.js, React.js, and Node.js). The application enables customers to browse rooms, make reservations, and manage bookings online, while providing dedicated dashboards for receptionists and administrators to streamline hotel operations.

The project was developed to strengthen practical knowledge of full-stack web development, RESTful API design, authentication systems, database management, and scalable web application architecture.

---

## 📑 Table of Contents

* Overview
* Live Demo
* Project Highlights
* System Architecture
* Key Features
* Security Features
* Technology Stack
* Deployment
* Project Structure
* Installation
* Environment Variables
* Roadmap
* License
* Developer

---

## 🌐 Live Demo

Explore the application:

**Frontend:** https://ivorycrest.vercel.app/

The deployed version showcases the complete booking workflow, role-based dashboards, room management, reservation handling, and hotel administration features.

---

## 🚀 Project Highlights

* Full-Stack MERN Application
* Secure JWT Authentication
* Role-Based Access Control (Admin, Receptionist, Customer)
* Dynamic Room Management
* Online Reservation System
* Automated Email Notifications
* PDF Booking Receipt Generation
* Responsive UI for Mobile and Desktop
* Analytics Dashboard
* RESTful API Architecture

---

## 🏗️ System Architecture

```text
┌─────────────────┐
│   React.js UI   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Express REST API│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ MongoDB Atlas   │
└─────────────────┘
```

---

## ✨ Key Features

### Customer Portal

* User Registration & Login
* Browse Available Rooms
* View Detailed Room Information
* Online Room Booking
* Booking History
* PDF Receipt Download
* Email Confirmation Notifications

### Reception Dashboard

* Reservation Management
* Guest Check-In
* Guest Check-Out
* Walk-In Guest Registration
* Booking Search System
* Reservation Status Tracking

### Admin Dashboard

* Room Management (CRUD)
* User Management
* Booking Monitoring
* Hotel Analytics
* Occupancy Tracking

---

## 🔒 Security Features

* JWT Authentication
* Password Hashing using bcryptjs
* Protected Routes
* Role-Based Authorization
* Secure API Access Control

---

## 🛠️ Technology Stack

### Frontend

* React.js
* React Router DOM
* Axios
* React Toastify
* Recharts
* jsPDF
* Vite

### Backend

* Node.js
* Express.js
* JWT (JSON Web Tokens)
* bcryptjs
* Nodemailer
* Node-Cron
* PDFKit

### Database

* MongoDB Atlas
* Mongoose

---

## 🚀 Deployment

| Service  | Platform      |
| -------- | ------------- |
| Frontend | Vercel        |
| Backend  | Render        |
| Database | MongoDB Atlas |

---

## 📁 Project Structure

```bash
ivory_crest
│
├── front_end
│   ├── src
│   │   ├── Admin
│   │   ├── auth
│   │   ├── Home
│   │   ├── Rooms
│   │   ├── Bookingform
│   │   ├── Payment
│   │   ├── Confirmation
│   │   ├── reception
│   │   └── ProtectedRoute
│
├── back_end
│   ├── config
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── utils
│   └── index.js
│
└── README.md
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/Pavan-kumarms27/ivory_crest.git
```

### Backend Setup

```bash
cd back_end
npm install
npm run dev
```

### Frontend Setup

```bash
cd front_end
npm install
npm run dev
```

---

## 🔧 Environment Variables

Create a `.env` file inside the `back_end` directory and configure the following variables:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

MAIL_USER=your_email

MAIL_PASSWORD=your_app_password
```

---

## 🗺️ Roadmap

* Payment Gateway Integration
* Room Reviews & Ratings
* Real-Time Notifications
* Advanced Analytics & Reporting
* Booking Cancellation Management

---

## 📄 License

This project is developed for educational and learning purposes.

---

## 👨‍💻 Developer

**Pavan Kumar M S**

Full Stack Developer | MERN Stack Enthusiast

GitHub: https://github.com/Pavan-kumarms27

---

If you found this project useful, consider giving it a ⭐ on GitHub.
