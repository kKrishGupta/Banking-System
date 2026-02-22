# 🏦 Banking Ledger System

A full-stack **Banking Ledger System** that allows users to create accounts and perform dummy real-time transactions securely.  
Built using **React.js (Frontend)** and **Node.js + Express.js (Backend)** with database integration.

---

## 🚀 Live Demo

🔗 **Frontend (Vercel):**  
https://banking-system-hazel.vercel.app  

🔗 **Backend (Render):**  
https://banking-system-zawl.onrender.com  

---

## 📌 Features

- ✅ User Registration & Login (JWT Authentication)
- ✅ Secure Token-Based Authorization
- ✅ Create & Manage Bank Accounts
- ✅ Perform Dummy Real-Time Transactions
- ✅ View Transaction History
- ✅ Protected Dashboard
- ✅ Role-based Authorization (System User Support)
- ✅ Blacklisted Token Handling (Logout Security)
- ✅ CORS-enabled for production deployment
- ✅ Fully deployed (Vercel + Render)

---

## 🛠 Tech Stack

### 🔹 Frontend
- React.js
- React Router
- Axios
- Zustand (State Management)
- Tailwind CSS (UI Styling)

### 🔹 Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (Authentication)
- Cookie Parser
- CORS

---

## 📂 Project Structure
banking-ledger-system/
│
├── frontend/
│ ├── src/
│ ├── public/
│ └── vercel.json
│
├── backend/
│ ├── src/
│ │ ├── routes/
│ │ ├── controllers/
│ │ ├── middleware/
│ │ ├── models/
│ │ └── config/
│ └── server.js
│
└── README.md
---

---

## 🔐 Authentication Flow

1. User registers → Account created  
2. User logs in → JWT token generated  
3. Token stored in HTTP-only cookie  
4. Protected routes validated using middleware  
5. Blacklisted tokens prevented from reuse  

---

## 💳 Transaction System

Users can perform:

- Credit Transactions  
- Debit Transactions  

### Features:
- Real-time balance updates  
- All transactions stored in database  
- Transaction history visible in dashboard  

⚠️ **Note:** This is a dummy banking system for learning/demo purposes only.

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone [https://github.com/your-username/banking-ledger-system.git](https://github.com/kKrishGupta/Banking-System.git)
cd banking-ledger-system

cd backend
npm install
