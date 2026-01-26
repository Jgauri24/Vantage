# Vantage: Pro-Serve Platform

Vantage is a premium service marketplace designed for high-end professional engagements. It facilitates seamless collaboration between **Clients** and **Providers** through a secure, milestone-based payment ecosystem and real-time communication.

## 🚀 Features

### For Clients
- **Engagement Management**: Post jobs with specific categories, budgets, and descriptions.
- **Milestone Payments**: Secure "Pay-After-Demo" flow where payment is held and released in stages (50% on demo approval, 50% on final completion).
- **Proposals Review**: View and compare provider bids with profiles and cover letters.
- **Admin Control**: Premium dashboard for platform oversight and analytics.

### For Providers
- **Smart Bidding**: Propose rates and approaches for open engagements.
- **Work Submission**: Securely upload files (images/PDFs) for client review.
- **Professional Profiles**: Display completion rates, hourly rates, and total earnings.
- **Wallet System**: Track earnings and manage simulated wallet funding for platform fees/security deposits.

### Core Architecture
- **Real-Time Communication**: Integrated one-on-one chat for active engagements using Socket.io.
- **Advanced Analytics**: Visual performance tracking for both clients (spend/engagements) and providers (earnings/success rate).
- **Elegant UI**: Modern, high-performance interface built with React 19, Vite, and Tailwind CSS.
- **Secure Backend**: Robust Node.js/Express 5.0 API with JWT authentication and Google OAuth 2.0 integration.
- **Unified Serving**: The backend is configured to serve the frontend production build and handle SPA routing.

---

## 🛠️ Tech Stack

**Frontend:**
- React 19 (Hooks, Context API)
- Vite
- Tailwind CSS 4.0
- Socket.io Client
- Axios

**Backend:**
- Node.js & Express 5.0
- MongoDB & Mongoose
- Socket.io
- Google OAuth (google-auth-library)
- JWT Authentication
- Multer (File Handling)

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)

### 1. Clone the repository
```bash
git clone <repository-url>
cd vantage
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder:
```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
STRIPE_SECRET_KEY=your_stripe_secret (optional for simulation)
```
Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```
Create a `.env` file in the `frontend` folder:
```env
VITE_API_URL=http://localhost:5001/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```
Start the frontend:
```bash
npm run dev
```

### 4. Production Build & Serving
To build both frontend and backend for production:
```bash
npm run build
npm start
```
This will build the Vite frontend and start the Express server which serves the static files.

---

## 🛡️ Governance & Security
- **Role-Based Access Control (RBAC)**: Strict separation between Client, Provider, and Admin roles.
- **Deletion Restrictions**: Active contracts cannot be deleted until completed or cancelled to protect data integrity.
- **Payment Security**: Simulated escrow-style wallet ensures funds are verified before work begins.

## 📜 License
This project is licensed under the ISC License.
