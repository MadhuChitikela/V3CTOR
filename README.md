# V3CTOR - Engineering Ideas Into Scalable Reality

V3CTOR is a premium, high-performance landing page and backend service tailored for AI/ML and software engineering consulting. It features fluid micro-animations, viewport snapping, responsive scaling (optimized for tablet, folding, and desktop displays), and a robust backend integration.

---

## 🚀 Key Features

* **Sleek, Rich Aesthetics**: Responsive layout styled with modern typography, HSL tailored palettes, gradients, and custom SVGs.
* **Animated Circuit Background**: Vector lines and active glowing pulse nodes that animate dynamically behind content.
* **Dual-Forwarding Email System**: Integrated Node.js SMTP service that logs project inquiries to a database and simultaneously notifies admins and clients.
* **Inline Branded Auto-Responders**: Automated client emails that render the new transparent logo (`1024x1024`) inline under a styled light banner, compatible with major email clients.
* **Asus Zenbook Fold & Tablet Optimization**: Stacked layouts and card sizing responsive to folds and tablets.
* **Honeypot Spam Protection**: Rejects automated submission bots transparently.

---

## 🛠 Tech Stack

* **Frontend**: HTML5, Vanilla CSS3 (custom variables, modern grids, flexbox, scroll-snapping, keyframes).
* **Backend**: Node.js (`http` server, native filesystem, path modules).
* **Emails**: `nodemailer` (SMTP relay, HTML templates, inline CID attachments).
* **Hosting**: 
  * Frontend: Vercel / GitHub Pages
  * Backend: Render / Railway / Node VPS

---

## 💻 Local Setup

### 1. Clone the Repository
```bash
git clone https://github.com/MadhuChitikela/V3CTOR.git
cd V3CTOR
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
# Server Config
PORT=3000

# Admin Notifications
ADMIN_EMAIL=vertexproject.in@gmail.com

# SMTP Server Configurations (Gmail SMTP Example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false

# SMTP Auth Credentials
SMTP_USER=vertexproject.in@gmail.com
SMTP_PASS=your_gmail_app_passcode
```

### 4. Run the Server
```bash
node server.js
```
The API server will listen on `http://localhost:3000` and save incoming submissions to `submissions.json`.

### 5. Access the Frontend
Open `index.html` directly in your browser or run it using a local live server.

---

## ☁️ Deployment

### Frontend (Vercel)
1. Push your code to GitHub.
2. Link your repository in [Vercel](https://vercel.com).
3. Vercel will host the static frontend files on a global CDN.

### Backend (Render / Railway)
1. Link your repository to [Render](https://render.com) or [Railway](https://railway.app) as a Node Web Service.
2. Add your environment variables (from your `.env` file) inside the hosting provider's dashboard settings.
3. Replace the fallback API URL in the `index.html` file with your live backend URL:
   ```javascript
   const apiHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
       ? 'http://localhost:3000'
       : 'https://your-backend-service.onrender.com'; // REPLACE this URL!
   ```
