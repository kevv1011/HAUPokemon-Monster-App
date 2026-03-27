# HAUPokemon Backend Architecture & Deployment Guide

## 1. Directory Structure (Local Workspace)
Your local workspace (`HAUPokemon_Backend`) is your **"Workshop"**. You will write all your code and test it here before deploying it to AWS. It is structured as follows:

```text
/HAUPokemon_Backend
├── config/
│   └── hauconnect.php           <-- Database Connection Config
├── database/
│   └── migration.sql            <-- Database Initialization Script
└── api/
    ├── auth/                    <-- Authentication Endpoints
    │   ├── login.php
    │   └── register.php
    ├── monsters/                <-- Monster Management Endpoints
...
    ├── locations/               <-- Spatial Location Endpoints
...
    └── catches/                 <-- Game Actions/Leaderboard
...
```

---

## 2. Server Architecture (AWS)
You are running a dual-region setup for security and performance.

### A. Database Server (N. Virginia - `us-east-1` Zone)
* **What goes here:** Nothing from your API folder except `migration.sql` (and only to initialize it).
* **Role:** Runs your MySQL database. 
* **Security:** Only accepts inbound traffic on Port 3306 from the Paris VPC via VPC Peering. No public internet access!

### B. Web Server (Paris - `eu-west-3` Zone)
* **What goes here:** Your `config/` and `api/` folders. (Upload them to `/var/www/html`).
* **Role:** Runs Apache/Nginx and processes your PHP files to query the Database.
* **Environment Variables:** Must be set on this server to tell PHP how to log into the database using the N. Virginia server's **Private IP**:
  * `DB_HOST` = (N. Virginia DB Private IP)
  * `DB_NAME` = `haupokemon_db`
  * `DB_USER` = (MySQL User)
  * `DB_PASS` = (MySQL Password)

---

## 3. The Secure Inter-Connection Layer

### A. Web Server <-> Database (VPC Peering)
To connect the Web Server in Paris to the Database in N. Virginia, you will use **Cross-Region VPC Peering**. This acts as a dedicated AWS fiber-optic cable between the two zones, keeping your database queries completely off the public internet.

### B. Mobile App <-> Web Server (Tailscale VPN)
To ensure that only authorized users can talk to your APIs, you are utilizing a Tailscale VPN Overlay.
1. The **Paris Web Server** runs the Tailscale daemon and is assigned a unique `100.x.x.x` IP address.
2. The **Mobile Device** runs the Tailscale app. When logged in, it joins the same private network.
3. In your **Mobile App Code**, your API Requests should point to the Tailscale IP (e.g. `http://100.64.12.34/api/auth/login.php`). If the user leaves the VPN, the APIs instantly become unreachable.

---

## 4. EC2 Automation Management (ON/OFF Mobile Switches)
To allow your mobile app to stop and start your EC2 instances cleanly without embedding risky AWS Root credentials:

1. **AWS Lambda:** Create three serverless functions (`StartInstances`, `StopInstances`, `GetStatus`). Give them a strict IAM Role that only lets them toggle your specific EC2 Instance IDs.
2. **API Gateway:** Put an AWS API Gateway in front of those Lambdas so you can call them via HTTP `POST` from the mobile app (e.g., `https://api-id.execute-api.eu-west-3.amazonaws.com/start`).
3. **App Integration:** In your mobile app UI, map buttons to those API Gateway URLs, and include a secure `x-api-key` in your HTTP Headers to prove authorization to AWS.
