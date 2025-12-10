# SkillBridge 🎓

> An AI-powered educational platform that makes learning engaging and personalized through adaptive lessons, gamification, and intelligent content generation.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)](https://firebase.google.com/)
[![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh/)

## 📖 Overview

SkillBridge is a comprehensive educational platform that combines AI-powered content generation with gamified learning experiences. Built with React Native (Expo) for mobile and a TypeScript backend powered by Bun and Hono, it delivers personalized learning paths for students across various subjects.

### ✨ Key Features

- 🤖 **AI-Powered Content Generation** - Dynamic lesson creation using Google Gemini AI
- 📱 **Cross-Platform Mobile App** - Native iOS and Android experience with Expo
- 🏆 **Gamification System** - XP points, streaks, and leaderboards to motivate learning
- 🎯 **Adaptive Assessments** - Smart quizzes that adapt to user performance
- 🌍 **Multi-Language Support** - Internationalization for global accessibility
- 📊 **Progress Tracking** - Detailed analytics and learning insights
- 🔊 **Text-to-Speech** - Audio support for enhanced accessibility
- 🔐 **Secure Authentication** - Firebase Auth integration with multiple providers

## 🏗️ Architecture

```bash
SkillBridge/
├── backend/          # Node.js/Bun API Server
│   ├── src/
│   │   ├── routes/   # API endpoints
│   │   ├── services/ # External services (Firebase, AI)
│   │   └── types/    # TypeScript definitions
│   └── Dockerfile    # Container configuration
└── frontend/         # React Native (Expo) Mobile App
    ├── src/
    │   ├── screens/  # App screens/pages
    │   ├── components/ # Reusable UI components
    │   ├── contexts/ # React contexts
    │   ├── lib/      # Utilities and configurations
    │   └── navigation/ # App navigation
    ├── app/          # Expo Router file-based routing
    └── assets/       # Images and static files
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **npm**
- **Bun** runtime (for backend)
- **Expo CLI** (`npm install -g @expo/cli`)
- **Firebase project** with Firestore and Authentication
- **Google Cloud API key** for Gemini AI

### 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd SkillBridge
   ```

2. **Setup Backend**

   ```bash
   cd backend
   bun install
   ```

3. **Setup Frontend**

   ```bash
   cd frontend
   npm install
   ```

### ⚙️ Configuration

#### Backend Configuration

1. **Firebase Setup**
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Firestore Database and Authentication
   - Download the service account key JSON file
   - Place it in `backend/` and update `src/services/firebase.ts`

2. **Google AI Configuration**
   - Get a Gemini AI API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Set up environment variables (create `.env` file):

   ```env
   GOOGLE_API_KEY=your_gemini_api_key
   FIREBASE_SERVICE_ACCOUNT_KEY=path_to_service_account.json
   PORT=3000
   ```

#### Frontend Configuration

1. **Firebase Configuration**
   - Add your Firebase config to `src/lib/firebase.ts`
   - Update `app.json` with your project details

2. **API Configuration**
   - Update the backend URL in `src/lib/api.ts`

### 🎯 Running the Application

#### Start Backend Server

```bash
cd backend
bun run dev
```

Backend will be available at `http://localhost:3000`

#### Start Frontend App

```bash
cd frontend
npx expo start
```

Choose your preferred development environment:

- 📱 **Expo Go** - Scan QR code with Expo Go app
- 🤖 **Android Emulator** - Press `a` to open in Android Studio emulator
- 🍎 **iOS Simulator** - Press `i` to open in iOS Simulator (macOS only)
- 🌐 **Web Browser** - Press `w` to open in web browser

## 🛠️ Development

### Backend API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/topics` | GET | Get all available topics |
| `/lessons/:topicId` | GET | Get lessons for a topic |
| `/generate-lesson` | POST | Generate AI-powered lesson content |
| `/assessments` | GET/POST | Manage assessments and submissions |
| `/user-profile` | GET/PUT | User profile and progress |
| `/leaderboard` | GET | Global leaderboard data |

### Frontend Screen Structure

```bash
📱 App Navigation
├── 🏠 Home Screen - Topic selection and user dashboard
├── 📚 Lessons List - Available lessons for selected topic  
├── 📖 Lesson Screen - Interactive lesson content
├── 🏆 Leaderboard - Global rankings and achievements
├── 👤 Profile Screen - User stats and preferences
├── 🌍 Language Selection - Multi-language support
└── 🔐 Auth Screen - Login and registration
```

### Key Technologies

**Backend:**

- **Hono** - Fast, lightweight web framework
- **Bun** - High-performance JavaScript runtime
- **Firebase Firestore** - NoSQL database
- **Google Gemini AI** - Content generation
- **TypeScript** - Type-safe development

**Frontend:**

- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and tools
- **React Navigation** - Navigation library
- **Firebase Auth** - User authentication
- **Expo AV** - Audio/video capabilities

## 📊 Features Deep Dive

### AI-Powered Content Generation

- Dynamic lesson creation based on topic and difficulty
- Adaptive content that adjusts to user learning patterns
- Multi-format content (text, interactive elements, assessments)

### Gamification System

- **XP Points** - Earned through lesson completion and assessment performance
- **Streak Tracking** - Daily learning streaks to encourage consistency
- **Leaderboards** - Global and friend-based ranking systems
- **Achievement Badges** - Milestone rewards for learning progress

### Accessibility Features

- **Text-to-Speech** - Audio narration for all content
- **Language Support** - Internationalization for multiple languages
- **Adaptive UI** - Responsive design for various screen sizes

## 🔒 Security & Authentication

- Firebase Authentication with multiple providers
- Secure API endpoints with token validation
- Environment-based configuration management
- Input validation and sanitization

## 🚢 Deployment

### Backend Deployment

```bash
# Build Docker container
docker build -t skillbridge-backend .

# Run container
docker run -p 3000:3000 skillbridge-backend
```

### Frontend Deployment

```bash
# Build for production
npx expo build

# Deploy with EAS Build
npx expo install @expo/cli
eas build --platform all
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write unit tests for new features
- Update documentation for API changes
- Follow conventional commit messages

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 🎯 Roadmap

- **Offline Mode** - Download lessons for offline learning
- **Peer Learning** - Social features and study groups
- **Advanced Analytics** - Detailed learning insights and recommendations
- **Voice Interaction** - Speech-to-text for hands-free learning
- **AR/VR Integration** - Immersive learning experiences
- **Teacher Dashboard** - Content management for educators

---

**Built with ❤️ by the SkillBridge Team**
*Empowering learners worldwide through AI-driven education*
