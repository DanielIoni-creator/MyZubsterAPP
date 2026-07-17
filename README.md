# MyZubster 🛒🔒

**Self-hosted Monero Payment Gateway + Open Source Skills Marketplace**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![License: GPLv3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![Monero](https://img.shields.io/badge/Monero-0.18.x-orange.svg)](https://www.getmonero.org/)
[![Docker](https://img.shields.io/badge/Docker-ready-blue.svg)](https://www.docker.com/)
[![Status](https://img.shields.io/badge/status-production-green.svg)]()

---

## 🎯 What is MyZubster?

MyZubster is a **self-hosted Monero payment gateway** designed to be modular, extensible, and easily integrable into any application.

The architecture consists of three layers:
┌─────────────────────────────────────────────────────────────────┐
│ MYZUBSTER ECOSYSTEM │
├─────────────────────────────────────────────────────────────────┤
│ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🏦 MYZUBSTER CORE │ │
│ │ Self-hosted Monero Payment Gateway │ │
│ │ - Subaddress generation │ │
│ │ - Transaction monitoring │ │
│ │ - Real-time exchange rates │ │
│ │ - JWT Authentication │ │
│ │ - PostgreSQL persistence │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ▲ │
│ │ │
│ ┌───────────────────────────┴───────────────────────────┐ │
│ │ 📱 NEIGHBORHOOD SKILLS APP │ │
│ │ Local skills marketplace │ │
│ │ - User registration │ │
│ │ - Skill listing │ │
│ │ - Monero payments │ │
│ │ - Seller dashboard │ │
│ └─────────────────────────────────────────────────────────┘ │
│ │
└─────────────────────────────────────────────────────────────────┘
text


---

## 📖 Open Source Projects

### 1️⃣ MyZubster (Core Gateway)

**Repository:** [DanielIoni-creator/MyZubsterAPP](https://github.com/DanielIoni-creator/MyZubsterAPP)

The heart of the system. A self-hosted Monero payment gateway that:
- Generates **unique subaddresses** for each transaction
- Automatically monitors payments (cron job every 60 seconds)
- Calculates **real-time XMR/USD exchange rates**
- Offers **REST API with JWT authentication**
- Persists data to **PostgreSQL**
- Is **Dockerized** for easy deployment

**Use MyZubster if you:**
- Want to accept Monero payments
- Have an e-commerce, SaaS, or any app that needs payments
- Want a self-hosted system with no third-party dependencies

---

### 2️⃣ MyZubster-Marketplace (Example App)

**Repository:** [DanielIoni-creator/MyZubster-Marketplace](https://github.com/DanielIoni-creator/MyZubster-Marketplace)

A **demonstration fork** showing how to integrate MyZubster into a real-world application: a **skills marketplace** (inspired by a "neighborhood skills" system).

**Features:**
- 👤 **Users** (registration, login, JWT)
- 🛠️ **Skills** (publishing, search, filters)
- 💰 **Monero payments** via MyZubster
- 📦 **Orders** with status tracking
- 🔍 **Real-time payment verification**
- 👨‍💼 **Seller dashboard** (profile, skills, earnings)

**This fork is ideal for:**
- Understanding how to integrate MyZubster into an app
- Using as a template for your own project
- Contributing to marketplace development

---

## 🌍 The "Neighborhood Skills" Project

This project was born with the goal of creating a **local skills ecosystem** where people can:

- **Offer** their skills (repairs, lessons, consulting, manual work)
- **Purchase** skills from other community members
- **Pay in Monero** privately and decentralized
- **Build** a network of trust and local collaboration

The "Neighborhood Skills" app is the primary use case demonstrating how Monero technology and MyZubster's modular architecture can support local economies.

---

## 🚀 Quick Start

### 1️⃣ Start MyZubster (Payment Gateway)

```bash
git clone https://github.com/DanielIoni-creator/MyZubsterAPP.git
cd MyZubsterAPP/backend
docker-compose up -d

2️⃣ Start the Marketplace (Fork)
bash

git clone https://github.com/DanielIoni-creator/MyZubster-Marketplace.git
cd MyZubster-Marketplace
npm install
npm start

3️⃣ Configure the Marketplace

Create a .env file:
bash

cp .env.example .env

Edit with your values:
env

DATABASE_URL=postgresql://postgres:password@localhost:5432/marketplace
MYZUBSTER_API_URL=http://localhost:3000
MYZUBSTER_API_TOKEN=your_jwt_token

📋 Repository Structure
text

MyZubster (Monorepo)
├── backend/                    # MyZubster Core (payment gateway)
│   ├── app.js
│   ├── models/
│   ├── routes/
│   └── services/
│
├── marketplace/                # Example app (fork)
│   ├── server.js
│   ├── models/ (User, Skill, ServiceOrder)
│   ├── routes/ (users, skills, orders)
│   └── middleware/ (JWT auth)
│
├── web-dashboard/              # Admin dashboard
├── mobile/                     # Android app (React Native)
└── docs/                       # Documentation

🔧 Customization
How to adapt the marketplace to your needs
Modification	Location
Add new skill categories	models/Skill.js
Modify order flow	routes/orders.js
Add reviews	Create models/Review.js and routes/reviews.js
Change default currency	.env → CURRENCY=USD
Add email notifications	services/email.js
🤝 Contributing

Contributions are welcome! Here's how you can help:

    Fork the repository

    Create a branch for your feature (git checkout -b feature/amazing-feature)

    Commit your changes (git commit -m 'Add amazing feature')

    Push to the branch (git push origin feature/amazing-feature)

    Open a Pull Request

📄 Licenses

This project uses a dual licensing model:

    MIT License for the core gateway and marketplace (maximum integration freedom)

    GNU GPLv3 for the Android app and full-stack application (protecting software freedom)

See LICENSE-MIT and LICENSE-GPLv3 for details.
🌟 Support

If you find this project useful, please give it a ⭐ on GitHub!
🔗 Useful Links
Resource	Link
MyZubster (Core)	https://github.com/DanielIoni-creator/MyZubsterAPP
MyZubster-Marketplace	https://github.com/DanielIoni-creator/MyZubster-Marketplace
Docker Hub	https://hub.docker.com/r/myzubster/myzubster
Author	DanielIoni-creator

Built with ❤️ for the Monero community and local neighborhood economies 🏘️