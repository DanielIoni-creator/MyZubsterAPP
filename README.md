# 🧩 MyZubster: Privacy-First Skill Exchange

**MyZubster** is an open-source Android app that connects neighbors to exchange skills and services — from plumbing and hairdressing to tutoring and tech support. With built-in Monero (XMR) payments, it’s designed for private, secure, peer-to-peer transactions without intermediaries.

[![License](https://img.shields.io/badge/License-MIT%20%7C%20GPLv3-blue?style=flat)](LICENSE)
[![Android](https://img.shields.io/badge/Platform-Android-brightgreen)](https://developer.android.com/)
[![Kotlin](https://img.shields.io/badge/Kotlin-1.9-purple)](https://kotlinlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org/)
[![Tests](https://img.shields.io/badge/Tests-Passing-brightgreen)](https://github.com/h4x0rmyzubster/MyZubsterh4x0r/actions)
[![Open Source](https://img.shields.io/badge/Open%20Source-Yes-blue)]()

---

## 🚀 What is MyZubster?

MyZubster is a hyperlocal skill-sharing platform. It lets people in the same neighborhood offer services, request help, chat, and pay using Monero — all in a privacy-first, self-hosted environment.

The goal is to empower communities to collaborate directly, bypassing centralized platforms and reducing costs.

---

## ✨ Key Features

### Core Features
- 🔐 **Monero Payments (XMR)** — Non-custodial, private, and secure. Users control their own keys.
- 🧑‍💼 **User Profiles** — Showcase skills you offer and list what you need.
- 💬 **Encrypted Chat** — Communicate safely with neighbors before confirming a transaction.
- 📍 **Location-Based Search** — Find services close to you.
- ⭐ **Reputation System** — Two-way reviews build trust in the community.
- 💰 **Transparent Fee** — A fair 2% platform fee keeps the project sustainable.
- 🛡️ **Recommended VPN Integration** — Works seamlessly with Mullvad VPN for extra privacy.

### Recent Implementations (July 2026)
- ✅ **Geolocation & Map** — Find skills near you with distance calculation and map visualization.
- ✅ **Escrow System** — Optional escrow for secure transactions. Funds are locked until work is confirmed.
- ✅ **Advanced Reputation System** — Total jobs completed, response rate, identity verification, and skill badges.
- ✅ **Admin Panel** — Moderation tools for reports, users, skills, and activity logs with role-based access (Admin/Moderator).
- ✅ **Self-Hosted Notifications** — UnifiedPush support (ntfy.sh) for privacy-first push notifications without Firebase.
- ✅ **Monero Payment Integration** — One-time addresses, QR code generation, transaction tracking, and 2% platform commission.
- ✅ **Automated Testing** — Unit tests for Kotlin (Android), API tests for Node.js backend, Monero integration tests, and CI/CD with GitHub Actions.
- ✅ **Internationalization** — Full English UI and documentation, with support for additional languages.
- ✅ **Dual Licensing** — MIT and GPLv3 licenses for maximum flexibility.

---

## 🏗️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Mobile** | Kotlin, Android SDK, Retrofit, ZXing, Material Design |
| **Backend** | Node.js, Express, MongoDB, JWT, bcrypt |
| **Payments** | Monero Wallet RPC, MoneroPay |
| **Escrow** | Custom escrow service with Monero multisig support |
| **Push Notifications** | UnifiedPush (ntfy.sh) / Firebase FCM (optional) |
| **AI (optional)** | Groq, Gemini (for skill descriptions) |
| **Testing** | JUnit (Android), Jest (Backend), MongoDB Memory Server |
| **CI/CD** | GitHub Actions (tests & build at every commit) |
| **Admin Panel** | React + Material-UI (optional) |

---

## 📱 Installation Guide

### Prerequisites
- Android Studio (latest)
- Node.js 16+
- MongoDB
- Monero wallet RPC (for testing payments)

### Clone the repository
```bash
git clone https://github.com/h4x0rmyzubster/MyZubsterh4x0r.git
cd MyZubsterh4x0r
Backend Setup
bash

cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI, Monero RPC URL, and API keys.
npm start
# The backend will run on http://localhost:3000

Android App

    Open the project in Android Studio.

    Sync Gradle and build the APK.

    Install the APK on your device (or use an emulator).

Run Tests
bash

# Backend tests
cd backend
npm run test

# Android tests (in Android Studio or terminal)
cd MyZubster
./gradlew test

# Run all tests with GitHub Actions (automated on every push)

🛡️ Escrow System

MyZubster includes an optional escrow system for secure transactions:
Status	Description
Pending	Escrow request created, waiting for funding
Funded	Funds locked in escrow, work in progress
Completed	Work completed, waiting for client confirmation
Released	Funds released to the professional
Disputed	Dispute opened, waiting for resolution

Flow:

    Client accepts the quote.

    Funds are locked in escrow.

    Professional completes the work.

    Client confirms completion.

    Funds are released (minus 2% platform fee).

🗺️ Geolocation & Map

MyZubster includes geolocation features to help users find services nearby:

    Distance Calculation: Shows how far each service is from your location.

    Map Visualization: Displays available skills on an interactive map.

    Nearby Search: Filter skills by distance radius.

    Address Autocomplete: Easy address entry when creating a service.

API Example
bash

GET /api/skills/nearby?lat=44.1&lng=12.5&radius=10

🛠️ Admin Panel

MyZubster includes a complete admin panel for community management:
Feature	Description	Role
Reports	View and manage user reports	Moderator
Users	List, filter, suspend/activate users	Admin
Skills	Approve or reject skill listings	Moderator
Stats	Dashboard with platform statistics	Moderator
Logs	Audit trail of all moderation actions	Admin
🧪 Testing

MyZubster uses a comprehensive testing strategy:
Test Type	Tool	Coverage
Android Unit Tests	JUnit, Mockito	Models, ViewModels, Utils
Backend API Tests	Jest, Supertest	Authentication, Users, Skills, Reviews
Monero Integration Tests	Jest, Supertest	Payment creation, status checks, webhooks
Escrow Tests	Jest, Supertest	Escrow creation, funding, release, disputes
Geolocation Tests	Jest, Supertest	Nearby search, distance calculation
CI/CD	GitHub Actions	Auto-run on every push and PR
🤝 How to Contribute

We welcome contributors of all experience levels!

    Fork the repository.

    Create a feature branch.

    Make your changes and test them.

    Submit a Pull Request with a clear description of your work.

See CONTRIBUTING.md for detailed guidelines.
🛡️ Security & Privacy

    Monero wallets remain non-custodial — private keys never leave the user's device.

    Backend uses environment variables for sensitive data; never commit .env files.

    All communication between client and server is encrypted via HTTPS.

    Push notifications support UnifiedPush (self-hosted ntfy.sh) as an alternative to Firebase.

    Admin Panel uses role-based access control (Admin/Moderator).

    Escrow uses Monero multisig for secure fund locking.

If you find a security issue, please contact the maintainer privately.
📄 License

This project is licensed under either the MIT License or the GNU General Public License v3.0, at your option.

SPDX-License-Identifier: MIT OR GPL-3.0-or-later
🙏 Acknowledgments

    Monero for privacy-first digital cash.

    Mullvad VPN for secure networking.

    UnifiedPush for decentralized push notifications.

    OpenClaw for AI assistance.

    All open-source libraries and contributors who make this project possible.

🚀 Ready to join the community?
Explore the code, report issues, or start contributing today!
