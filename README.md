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
If you get the error: `npm: The term 'npm' is not recognized`, follow these steps carefully:

#### 1. Fix "NPM Not Recognized" (Environment Setup)
* **Download:** Go to [nodejs.org](https://nodejs.org/) and download the **LTS** version.
* **Install:** Run the installer and click "Next" through all steps.
* **RESTART:** You **must** close VS Code and reopen it for the terminal to recognize the new commands.

#### 2. Initialize and Run the Project
Run these commands in your VS Code terminal:
```bash
# 1. Navigate to the app directory
cd "haupokemon-monster's-app"

# 2. Install all project dependencies (creates node_modules)
npm install

# 3. Start the development server
npm run dev

📲 Mobile Installation
Download the latest app-debug.apk from the Releases page.

Install on an Android device (enable "Unknown Sources" in settings).

Ensure Tailscale is connected on the phone to sync data with the cloud.

🛠️ Tech Stack
Frontend: React (TypeScript), Vite, Tailwind CSS, Capacitor.

Backend: PHP 8.x, MySQL.

Cloud: AWS EC2, VPC Peering, Tailscale VPN.

Design: Stitch High-Fidelity Prototyping.

---

### **Final GitHub Push Checklist:**
1.  **Paste** the above into `README.md` and **Save**.
2.  **Commit:** `git add .` then `git commit -m "Final submission README with NPM troubleshooting"`
3.  **Push:** `git push origin main`

**You are officially done! Is there anything else you need before you send the repo link to your prof?**
