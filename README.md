# 🏥 Hospital Smart System

A full-stack smart hospital management system with AI-powered features including a chatbot assistant, eye disease analysis, appointment booking, and medical records management.

---

## ✨ Features

- 🤖 **AI Chatbot Assistant** — 24/7 smart assistant powered by Groq (Llama) that responds in the user's language
- 👁️ **Eye Disease Analysis** — AI-powered eye image analysis for early diagnosis
- 📅 **Appointment Booking** — Book appointments with doctors online
- 👨‍⚕️ **Doctor Profiles** — Browse doctors by specialty and availability
- 🏥 **Medical Departments** — View all hospital departments and services
- 📋 **Medical Records** — Secure patient medical history management
- 🔐 **QR Code Access** — Generate and scan QR codes for patient records
- 🔑 **Authentication** — JWT-based login for patients and doctors

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


