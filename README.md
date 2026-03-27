# HAUPokemon-Monster-App
# HAUPokemon: Distributed Monster Tracking System

A high-fidelity mobile application and distributed cloud backend system built for tracking and managing virtual entities across multiple AWS regions.

## 🏗️ Architecture Overview
This project utilizes a multi-region AWS infrastructure to ensure separation of concerns and data security.

* **Web Server (Paris - eu-west-3):** Hosts the PHP API Gateway and the React/Vite frontend.
    * **Public IP:** 35.181.160.225
* **Database Server (N. Virginia - us-east-1):** Dedicated MySQL host for game data.
    * **Private IP:** 10.1.1.101 (Accessed via VPC Peering)
* **Networking:** Secured via Tailscale VPN and cross-region VPC Peering.

## 📱 Features
* **GPS-Based Catching:** Real-time proximity checking between user coordinates and monster spawn points.
* **Hardware Integration:** Automated 5-second flashlight trigger and alarm audio upon successful capture.
* **Real-time Leaderboard:** Dynamic "Elite Ranks" display fetching the top 10 monster hunters.
* **Admin Control Center:** Interactive Google Maps interface for monster spawning and AWS EC2 instance management.

## 🛠️ Tech Stack
* **Frontend:** React (TypeScript), Vite, Tailwind CSS.
* **Backend:** PHP 8.x, MySQL.
* **Cloud:** AWS EC2, VPC Peering, Tailscale VPN.
* **Design:** Stitch High-Fidelity Prototyping.

## 🚀 Getting Started

### Prerequisites
1. Connect to the project **Tailscale VPN** network.
2. Ensure your local environment has **Node.js** and **PHP** installed.

### Installation
1. Clone the repository:
   ```bash
   git clone [https://github.com/kevv1011/HAUPokemon-Monster-App.git](https://github.com/kevv1011/HAUPokemon-Monster-App.git)
