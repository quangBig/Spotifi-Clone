# 🎵 Realtime Spotify Application

A full-stack Spotify clone with real-time features, built with modern web technologies.

## ✨ Features

- 🎸 Music Player
  - Play, pause, next, and previous controls
  - Volume control with slider
  - Real-time playback status
  - See what others are listening to

- 👨‍💼 User Features
  - User authentication with Clerk
  - Online/Offline status tracking
  - Real-time user activity
  - Favorite songs and albums management
  - Create and manage personal playlists
  - Save and organize favorite tracks

- 💬 Social Features
  - Real-time chat integration
  - Live listening status
  - User interaction
  - Share favorite songs and albums
  - Follow other users' music preferences

- 📊 Admin Dashboard
  - Create and manage albums
  - Upload and manage songs
  - Analytics and insights
  - User management

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Cloudinary account
- Clerk account

### Environment Setup

#### Backend (.env)
```bash
PORT=...
MONGODB_URI=...
ADMIN_EMAIL=...
NODE_ENV=...

# Cloudinary Configuration
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_CLOUD_NAME=...

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
```

#### Frontend (.env)
```bash
VITE_CLERK_PUBLISHABLE_KEY=...
```

## 🛠️ Tech Stack

- Frontend: React, Vite
- Backend: Node.js, Express
- Database: MongoDB
- Real-time: Socket.io
- Authentication: Clerk
- File Storage: Cloudinary
- State Management: Redux/Context API

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

