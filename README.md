# 🏥 Hospital Smart System

A full-stack smart hospital management system with AI-powered features including a chatbot assistant, eye disease analysis, appointment booking, and medical records management.

---

## ✨ Features

* 🤖 AI Chatbot Assistant — 24/7 intelligent healthcare assistant powered by Groq (Llama), providing instant responses in the user's preferred language.
* 👁️ AI Eye Disease Detection — Advanced AI-powered eye image analysis for early disease screening and diagnosis support.
* 📅 Online Appointment Management — Schedule, reschedule, and manage doctor appointments seamlessly through the platform.
* ⏰ Automated Appointment Reminders — Email notifications and reminders sent automatically to patients before their scheduled appointments.
* 👨‍⚕️ Doctor Directory & Profiles — Browse doctor profiles, specialties, qualifications, availability, and consultation schedules.
* 🏥 Hospital Departments & Services — Explore all medical departments, specialties, and healthcare services offered by the hospital.
* 📋 Dynamic Medical Records Management — Securely manage and update patient medical records, including diagnoses, prescriptions, treatment plans, and visit history in real time.
* 📁 Medical File Upload & Sharing — Patients and doctors can upload, view, and share medical documents, reports, prescriptions, laboratory results, and radiology images.
* 🔐 QR Code-Based Patient Access — Generate and scan unique QR codes for quick and secure access to patient medical records.
* 💳 Online Payment Integration — Secure online payment support, including InstaPay and other digital payment methods for appointments and medical services.
* 🔑 Secure Authentication & Authorization — JWT-based authentication with role-based access control for patients, doctors, and administrators.
* 📊 Admin Dashboard & System Management — Comprehensive administration panel for managing users, doctors, appointments, departments, medical records, payments, reports, and overall system operations.
* 📈 Analytics & Reporting — Real-time system statistics and reports for appointments, patient activity, doctor performance, and hospital operations.
* 🔔 Notifications System — In-app and email notifications for appointments and important healthcare alerts.
---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React + TypeScript | UI framework |
| Vite | Build tool |
| Tailwind CSS | Styling |
| React Router | Navigation |
| ReactMarkdown + remark-gfm | Markdown rendering in chatbot |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|---|---|
| .NET 10 (ASP.NET Core) | REST API |
| Entity Framework Core | ORM |
| SQLite | Database |
| JWT | Authentication |
| Groq API (Llama 3.3) | AI Chatbot |

### AI Services
| Technology | Purpose |
|---|---|
| Python (FastAPI) | Eye analysis microservice |
| TensorFlow / Keras | Eye disease classification model |
| Groq API | Chatbot language model |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- .NET 10 SDK
- Python 3.10+
- Groq API Key → [console.groq.com](https://console.groq.com)

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/ayahelhwary/HospitalProject.git
cd HospitalProject
```

---

### 2️⃣ Backend Setup (.NET)

```bash
cd BackendHospitalProject
```

Create `appsettings.json` (not included for security):

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=hospital_data.db"
  },
  "Groq": {
    "ApiKey": "YOUR_GROQ_API_KEY"
  },
  "Jwt": {
    "Key": "YourSuperSecretKeyHere_MustBe32CharsOrMore!",
    "Issuer": "HospitalAPI",
    "Audience": "HospitalApp",
    "ExpiryHours": "24"
  }
}
```

Run the backend:

```bash
dotnet restore
dotnet run
```

Backend runs on: `http://localhost:5242`  
Swagger UI: `http://localhost:5242/swagger`

---

### 3️⃣ Frontend Setup (React)

```bash
cd FrontendHospitalProject
```

Create `.env` file:

```env
VITE_API_URL=http://localhost:5242
```

Install and run:

```bash
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

### 4️⃣ Eye AI Service Setup (Python)

```bash
cd EyeAIService
pip install -r requirements.txt
python main.py
```

---

## 📁 Project Structure

```
HospitalProject/
├── BackendHospitalProject/     # .NET REST API
│   ├── Controllers/            # API endpoints
│   ├── DTOs/                   # Data transfer objects
│   ├── Data/                   # Database context
│   └── Services/               # Business logic
├── FrontendHospitalProject/    # React frontend
│   ├── src/
│   │   ├── components/         # UI components (incl. AIChatbot)
│   │   ├── pages/              # App pages
│   │   └── lib/                # API service layer
└── EyeAIService/               # Python AI microservice
```

---

## 🔒 Environment Variables

| File | Variable | Description |
|---|---|---|
| `appsettings.json` | `Groq:ApiKey` | Groq API key for chatbot |
| `appsettings.json` | `Jwt:Key` | JWT secret key |
| `.env` | `VITE_API_URL` | Backend API URL |

> ⚠️ Never commit `appsettings.json` or `.env` to GitHub.


