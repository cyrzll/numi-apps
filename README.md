# 🌟 NUMI (Math Adventure Game)

NUMI (formerly *Kancil Belajar*) is a premium, kawaii-themed, offline-capable children's math learning game app. Built with **Ionic React**, **Capacitor**, and **Node.js**, it features engaging RPG/pet-care style elements (rooms, shop, inventory, maps) alongside arithmetic quizzes to make math learning interactive and fun.

---

## 📂 Project Structure

This monorepo contains the following components:

- **[apps/](file:///Users/rizal/projek/astro-js/hackaton/apps)**: The frontend game client built with React, Vite, Ionic Framework, and TailwindCSS. It integrates Capacitor to compile into a native Android application.
- **[backend/](file:///Users/rizal/projek/astro-js/hackaton/backend)**: The Node.js / TypeScript API backend service utilizing Drizzle ORM and WebSockets for real-time capabilities.

---

## 🛠️ Tech Stack

### Frontend (`apps`)
- **Framework**: Ionic React + React 19 + TypeScript
- **Styling**: TailwindCSS
- **Build Tool**: Vite
- **Mobile Wrapper**: Capacitor (Android target)
- **State/Database**: Offline-first simulated SQLite interceptor fallback in localStorage
- **Animations**: GSAP (GreenSock Animation Platform)

### Backend (`backend`)
- **Runtime**: Node.js + TypeScript
- **Database ORM**: Drizzle ORM
- **Realtime**: WebSockets

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Android Studio](https://developer.android.com/studio) (for running and compiling the Android app)
- Gradle & Java Development Kit (JDK 17)

---

## 💻 Development Guide

### 1. Frontend Development (`apps`)

Navigate to the `apps` folder:
```bash
cd apps
```

#### Install Dependencies
```bash
npm install
```

#### Run Web Development Server
This runs the web app locally on [http://localhost:8100](http://localhost:8100):
```bash
npm run dev
```

#### Build & Sync to Android
To compile the web assets and copy them to the Android project wrapper:
```bash
npm run build
npx cap sync android
```
After syncing, you can open the Android project in Android Studio:
```bash
npx cap open android
```

---

### 2. Backend Development (`backend`)

Navigate to the `backend` folder:
```bash
cd backend
```

#### Install Dependencies
```bash
npm install
```

#### Run Dev Server
```bash
npm run dev
```

---

## 📱 Android Customizations Implemented

- **Immersive Fullscreen Mode**: Set up in `MainActivity.java` to hide the system soft navigation keys and status bar automatically for an uninterrupted game experience.
- **Safe Area Padding**: The UI header automatically adjusts to device notch heights using safe-area variables.
- **Kawaii Launcher Icons**: High-quality customized round and standard launcher mipmap assets generated at all DPI densities.
- **Offline Mode**: Ensures database profiles remain active in the local simulated storage during development and offline plays.
