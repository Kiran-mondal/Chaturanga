# 👑 Chaturanga - Ancient Indian Strategy Board Game Engine

Welcome to **Chaturanga**, a modern, lightweight, full-stack revival of the ancient Indian strategy board game, which is globally recognized as the common ancestor of modern Chess. 

This project brings the 8x8 uncheckered **Ashtapada** board to life with dynamic client-side mechanics, a smart AI learning simulator, and full-stack connectivity architecture.

---

## 🌍 Live Demo & Web App Link
Anyone can play the game instantly without installing anything. Click the official public web link below to play directly in your mobile or desktop browser:

👉 **[Play Chaturanga Live on Render](https://chaturanga-6wdo.onrender.com)**

---

## 🤖 Featured Game Modes

### 1. Play vs Computer AI (Training Mode)
* Perfect for beginners who have never played Chaturanga before.
* Players control the golden **White Armies** at the bottom, while the **Computer AI** dynamically commands the **Red Armies** at the top.
* Features a **Live System Log & Learning Guide** that explains every move the AI executes in real-time, helping you learn traditional battlefield tactics effortlessly.

### 2. 2-Player Pass & Play
* Play locally on the same screen with a friend, taking turns to move pieces across the Ashtapada grid.

---

## 📜 Historical Pieces & Rules Dictionary

The game maps the four traditional divisions of the ancient Indian military using custom character signs:

| Piece Sign | Historical Name | Modern Equivalent | Movement Rule Details |
| :---: | :--- | :--- | :--- |
| **👑** | **Raja** | King | Moves exactly 1 square in any direction. Capture it to win. |
| **📜** | **Mantri** | Minister / Counselor | Weak piece; moves exactly 1 square diagonally only. |
| **🐘** | **Gaja** | Elephant | Moves exactly 2 squares diagonally. Can jump over other pieces. |
| **🐎** | **Ashva** | Horse / Cavalry | Moves in a standard L-shape. Can jump over other pieces. |
| **🛕** | **Ratha** | Chariot | Moves any number of empty squares straight horizontally/vertically. |
| **🛡️** | **Padati** | Foot-soldier / Pawn | Moves 1 square straight forward only. Captures 1 square diagonally. |

---

## 🛠️ Tech Stack & Architecture Behind the Project

This project leverages modern production tools optimized for scalable, cloud-native automation:

* **Frontend:** Interactive HTML5 Canvas/DOM, responsive UI structure styled with **Tailwind CSS**.
* **Backend Runtime:** **Node.js** paired with **Express.js** to handle asynchronous microservices.
* **Database Management:** Serverless **PostgreSQL via Neon DB** to efficiently map real-time game logs and match setups.
* **Hosting Platform:** Seamless continuous deployment setup powered by **Render**.
* **AI Engine & Validation:** Automated `aiBot.js` layer designed to monitor rule configurations and fix data conflicts.

---

## 🚀 How This Project Runs Globally
1. **GitHub Repository:** Acts as the public codebase core, managing file updates and configurations.
2. **Render Integration:** Watches the GitHub repository. Whenever a change is committed, Render triggers a cloud auto-deploy build.
3. **Neon DB Serverless Pipeline:** Secures state updates through optimized connection pools under strict SSL encryption layers.
4. 
