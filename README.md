# InDoorNav — Web Admin Panel

<p align="center">
  <b>Web-based administration panel for creating and editing indoor navigation maps and ArUco marker graphs.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-active-success.svg" alt="Status">
  <img src="https://img.shields.io/badge/react-18.x-blue.svg" alt="React">
  <img src="https://img.shields.io/badge/typescript-~5.x-blue.svg" alt="TypeScript">
  <img src="https://img.shields.io/badge/vite-8.3.4-orange.svg" alt="Vite">
  <img src="https://img.shields.io/badge/supabase-backend-green.svg" alt="Supabase">
</p>

---

## 📖 About the Project

**InDoorNav** is part of an engineering thesis project (Praca Inżynierska) at PJATK. The system provides an offline-capable indoor navigation solution for visually impaired users.

While the mobile application handles local positioning via ArUco optical markers, sensor fusion (IMU/compass), and pathfinding (Dijkstra's algorithm), this **Web Administration Panel** allows administrators to digitize building floor plans, place navigation nodes, and compile structural graph data into a lightweight JSON format stored in a cloud database.

---

## 🚀 Key Features

* **Interactive Infinite Canvas:** Powered by **React Flow (`@xyflow/react`)**, allowing smooth panning, zooming, and node manipulation[cite: 1].
* **Floor Plan Integration:** Upload building layouts (PNG/JPG) as background sublayers with automatic proportion calculation and fixed background locking[cite: 1, 4].
* **Custom ArUco Nodes:** Visual node editor with resizable elements (`NodeResizer`), clear ID badges, and orientation adjustments[cite: 1, 4, 8].
* **Automated Graph Metrics:** Automatically calculates Euclidean distances between connected markers and determines directional navigation azimuths (`[0°, 360°)`)[cite: 3].
* **GPS & Metadata Binding:** Links building layouts to global coordinates (`latitude`, `longitude`) for automatic map selection by the mobile app[cite: 1].
* **Cloud Persistence:** Seamless synchronization with **Supabase (PostgreSQL & Storage)** to store building metadata and compiled Adjacency List JSON graphs[cite: 1, 2].

---

## 🛠️ Tech Stack

* **Frontend:** React, TypeScript, Vite[cite: 1]
* **UI & Graph Engine:** Tailwind CSS, `@xyflow/react` (React Flow)[cite: 1]
* **Backend & Database:** Supabase (`@supabase/supabase-js`, PostgreSQL, Supabase Storage)[cite: 1]
* **Deployment:** GitHub Pages (`gh-pages`)[cite: 1]

---

## 📂 Project Structure

```text
InDoorNav/
├── src/
│   ├── api/
│   │   └── supabaseClient.ts      # Supabase client configuration
│   ├── types/
│   │   └── navigation.ts          # TypeScript interfaces (Nodes, Edges, Graph)
│   ├── components/
│   │   └── editor/
│   │       ├── MapCanvas.tsx      # Main workspace, toolbar, and JSON compiler
│   │       ├── FloorplanNode.tsx  # Background floor plan renderer
│   │       └── CustomArUcoNode.tsx# Interactive ArUco marker node component
│   ├── App.tsx                    # Root component
│   └── main.tsx                   # Entry point
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## ⚙️ Getting Started (Local Development)
**Prerequisites:** Make sure you have Node.js (v18 or higher) installed on your machine.

1. Clone the repository
Bash
git clone [https://github.com/YOUR_USERNAME/InDoorNav.git](https://github.com/YOUR_USERNAME/InDoorNav.git)
cd InDoorNav
2. Install dependencies
Bash
npm install
3. Configure Environment Variables
Create a .env file in the root directory of the project and add your Supabase credentials:

Fragment kodu
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
4. Run the development server
Bash
npm run dev
Open http://localhost:5173 in your browser to view the admin panel.

## 📦 Deployment
To build the project for production and deploy it to GitHub Pages:

Bash
npm run deploy
👥 Authors
Engineering Thesis Project — PJATK (Polsko-Japońska Akademia Technik Komputerowych)