<div align="center">

<img src="https://img.shields.io/badge/RapidService-Marketplace-0f172a?style=for-the-badge&logoColor=white" alt="RapidService" />

# ⚡ RapidService

### A full-stack service marketplace connecting clients with skilled professionals.

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue?style=flat-square)](LICENSE)

<br />

[Features](#-features) · [Tech Stack](#️-tech-stack) · [Getting Started](#-getting-started) · [Project Structure](#-project-structure) · [Security](#-security)

</div>

---

## 📸 Overview

**RapidService** is a production-ready service marketplace platform where clients can discover, book, and pay for services — and providers can manage their business end-to-end. Built with a modern React frontend and a scalable Node.js/Express backend, it supports three distinct user roles: **Client**, **Provider**, and **Admin**.

---

## ✨ Features

### 👤 For Clients
- 🔍 **Service Discovery** — Search and filter services by category, location, and rating
- 🧑‍💼 **Provider Profiles** — Detailed profiles with work history, skills, and reviews
- 📅 **Booking System** — Streamlined booking flow with real-time availability
- 💳 **Secure Payments** — Integrated with Razorpay for safe, seamless transactions
- 📊 **Client Dashboard** — Track bookings, monitor service status, and message providers

### 🔧 For Service Providers
- 🪪 **Profile Management** — Showcase skills, services, and portfolio
- 📋 **Booking Management** — Accept/decline requests and manage schedules
- 💰 **Earnings Tracking** — Monitor income, payouts, and payment history
- 🖥️ **Provider Dashboard** — Dedicated workspace for managing all professional activity

### 🛡️ For Admins
- 👥 **User Management** — Oversee and moderate client and provider accounts
- 🗂️ **Service Oversight** — Manage listings, categories, and content moderation
- 📈 **Platform Analytics** — View performance metrics and transaction logs

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React.js (Vite) |
| **Styling** | Tailwind CSS + Shadcn UI |
| **State Management** | TanStack Query (React Query) |
| **Routing** | React Router DOM |
| **Icons** | Lucide React |
| **Maps** | Leaflet |
| **Backend Runtime** | Node.js |
| **Backend Framework** | Express.js |
| **Database** | MongoDB + Mongoose |
| **Authentication** | JWT + Bcrypt |
| **Validation** | Joi |
| **Security** | Helmet + CORS |
| **Payments** | Razorpay API |

---

## 📂 Project Structure

```
RapidService/
├── backend/                  # Express REST API
│   ├── config/               # Database & global config
│   ├── controllers/          # Route handlers / business logic
│   ├── middleware/           # Auth guards & error handling
│   ├── models/               # Mongoose schemas & models
│   ├── routes/               # API endpoint definitions
│   └── server.js             # Application entry point
│
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Full-page route views
│   │   ├── hooks/            # Custom React hooks
│   │   └── lib/              # API clients & utilities
│   └── vite.config.js        # Vite build configuration
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) `v18+`
- [MongoDB](https://www.mongodb.com/) (Local instance or Atlas cluster)
- [Razorpay Account](https://razorpay.com/) (for payment processing)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/RapidService.git
cd RapidService
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_uri
JWT_SECRET=your_super_secret_jwt_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Start the development server:

```bash
npm run dev
```

> The API will be running at `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

> The app will be available at `http://localhost:8080`

---

## 🔒 Security

RapidService is built with security in mind:

| Measure | Implementation |
|---|---|
| Password Hashing | `bcrypt` with salt rounds |
| Route Protection | JWT-based authentication middleware |
| Input Validation | `joi` schema validation on all requests |
| Security Headers | `helmet` middleware |
| Cross-Origin Policy | Configured `cors` |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 📜 License

This project is licensed under the **ISC License**. See the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ by the RapidService Team

</div>
