# Personal Portfolio Website — Full Stack

A modern, responsive full-stack personal portfolio built with:
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js + Express.js
- Database: MongoDB / MongoDB Atlas
- Contact form API
- Projects stored and loaded from the database
- Ready for deployment with a static frontend + Render/Railway-style backend

## 1. Requirements
- Node.js 18+
- MongoDB local or MongoDB Atlas account

## 2. Setup

### Backend
```bash
cd backend
npm install
copy .env.example .env
```

Open `backend/.env` and set:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
ADMIN_KEY=change_this_admin_key
```

Start:
```bash
npm run dev
```

### Frontend
Open `frontend/index.html` with a browser, or use VS Code Live Server.

For local backend, the frontend uses:
`http://localhost:5000/api`

## 3. Add sample projects

After starting the backend:
```bash
POST http://localhost:5000/api/projects/seed
```
with header:
`x-admin-key: YOUR_ADMIN_KEY`

You can also use the included API endpoints from Postman.

## API
- `GET /api/health`
- `GET /api/projects`
- `POST /api/projects`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`
- `POST /api/projects/seed`
- `POST /api/contact`

## Deployment

### Backend
Deploy `backend` to Render, Railway, or another Node.js host.
Set:
- `MONGODB_URI`
- `ADMIN_KEY`
- `PORT` if required

### Frontend
Deploy `frontend` to Vercel, Netlify, or GitHub Pages.
Before deployment, edit `frontend/js/config.js` and replace the API URL with your deployed backend URL.

## Important
Do not commit `.env` or real API keys/passwords to GitHub.
