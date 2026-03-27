# 🐉 HAUPokemon: Distributed Monster Tracking System
**Final Project for Cloud Computing & Mobile Application Development**

A high-fidelity mobile application and distributed cloud backend system built for tracking and managing virtual entities across multiple AWS regions.

---

## 👥 The Development Team & Roles

| Name | Role | Primary Responsibilities |
| :--- | :--- | :--- |
| **[Your Name]** | **Lead Full-Stack Developer** | Mobile App Dev (React/Capacitor), Cloud Orchestration, & Git Management. |
| **Calaguas** | **Backend Engineer** | PHP API Gateway Development (AWS Paris) & Logic Implementation. |
| **Manusig** | **Database Administrator** | RDS/MySQL Instance Management (US-East-1) & Schema Design. |
| **Lumba** | **QA & Media Specialist** | System Testing, Video Production, & Final Presentation Lead. |
| **Pagcu** | **Project Coordinator** | Technical Documentation, UI/UX Design Support, & Integration Testing. |

---

## 🏗️ Architecture Overview
This project utilizes a **Multi-Region AWS Infrastructure** to ensure separation of concerns and data security.

* **Web Server (Paris - `eu-west-3`):** Hosts the PHP API Gateway and the React/Vite frontend.
    * **Public IP:** `35.181.160.225`
* **Database Server (N. Virginia - `us-east-1`):** Dedicated MySQL host for game data.
    * **Private IP:** `10.1.1.101` (Secure access via **VPC Peering**)
* **Networking:** Secured via **Tailscale VPN** and cross-region VPC Peering to prevent unauthorized database access.

## 📱 Key Features
* **GPS-Based Catching:** Real-time proximity checking between user coordinates and monster spawn points.
* **Hardware Integration:** Automated 5-second flashlight trigger and sound alarm upon successful capture.
* **Real-time Leaderboard:** Dynamic "Elite Ranks" display fetching the top 10 monster hunters.
* **Admin Control Center:** Interactive Google Maps interface for monster spawning and AWS EC2 instance automation.

---

## 🚀 Getting Started

### ⚠️ Network Requirements (Crucial)
To interact with the live backend and database, you **must** be part of the project's private network:
1.  Install **Tailscale** on your testing device.
2.  Request access from the **Project Owner** to be added to the machine group.
3.  Ensure the VPN is **Active** before launching the app.

### 💻 Local Development Setup
If you want to run the project locally on your machine:

#### 1. Pre-requisite: Install Node.js
If you see an error saying `'npm' is not recognized`, you must install the Node.js runtime first:
* **Download:** [nodejs.org](https://nodejs.org/) (Choose the **LTS** version).
* **Important:** Restart VS Code/Terminal after installation.

#### 2. Initialize the Project
Run these commands in your terminal:
```bash
# Navigate to the app directory
cd "haupokemon-monster's-app"

# Install all project dependencies
npm install

# Start the development server
npm run dev
