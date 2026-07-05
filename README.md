# 🌟 NUMI (Math Adventure Game)

NUMI (formerly *Kancil Belajar*) is a premium, kawaii-themed, offline-capable children's math learning game app. Built primarily using **Ionic React** (compiled via **Capacitor** to a native Android package), it features engaging RPG/pet-care style elements (rooms, shop, inventory, maps) alongside arithmetic quizzes to make math learning interactive and fun.

---

## 📂 Project Structure

This repository represents the main client application of NUMI:

- **[apps/](file:///Users/[user]/projek/astro-js/hackaton/apps)**: The frontend game client built with React, Vite, Ionic Framework, and TailwindCSS. It integrates Capacitor to compile into a native Android application.

*(Note: The optional multi-user/database synchronization backend service code resides on the `feature/kampung-numi` branch, leaving the `main` branch optimized for the local offline-first Android application gameplay).*

---

## 🛠️ Tech Stack

### Frontend & Mobile Wrapper (`apps`)
- **Framework**: Ionic React + React 19 + TypeScript
- **Styling**: TailwindCSS
- **Build Tool**: Vite
- **Mobile Wrapper**: Capacitor (Android target compilation)
- **State/Database**: Offline-first simulated SQLite interceptor fallback in localStorage
- **Animations**: GSAP (GreenSock Animation Platform)

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v22 or higher recommended)
- [Android Studio](https://developer.android.com/studio) (for running and compiling the Android app)
- Gradle & Java Development Kit (JDK 21)

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

## 📱 Android Customizations Implemented

- **Immersive Fullscreen Mode**: Set up in `MainActivity.java` to hide the system soft navigation keys and status bar automatically for an uninterrupted game experience.
- **Safe Area Padding**: The UI header automatically adjusts to device notch heights using safe-area variables.
- **Kawaii Launcher Icons**: High-quality customized round and standard launcher mipmap assets generated at all DPI densities.
- **Offline Mode**: Ensures database profiles remain active in the local simulated storage during development and offline plays.
