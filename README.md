# IDEA Project SoSe25

[![Status](https://img.shields.io/badge/status-WIP-orange)]()
[![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=61dafb&labelColor=20232a)]()
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=ffffff&labelColor=232323)]()
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=nodedotjs&logoColor=fff&labelColor=20232a)]()
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=fff&labelColor=1b1f24)]()
[![Redux](https://img.shields.io/badge/Redux-Toolkit-764ABC?logo=redux&logoColor=fff&labelColor=1b1f24)]()
[![MUI](https://img.shields.io/badge/MUI-Design-007FFF?logo=mui&logoColor=fff&labelColor=0b1620)]()
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Utility-38B2AC?logo=tailwindcss&logoColor=fff&labelColor=0b1620)]()
[![D3.js](https://img.shields.io/badge/D3.js-Data%20Viz-F9A03C?logo=d3dotjs&logoColor=fff&labelColor=1b1f24)]()
[![Chart.js](https://img.shields.io/badge/Chart.js-Charts-FF6384?logo=chartdotjs&logoColor=fff&labelColor=1b1f24)]()
[![Shepherd.js](https://img.shields.io/badge/Shepherd.js-Walkthrough-6C5CE7?labelColor=1b1f24)]()
[![Notistack](https://img.shields.io/badge/notistack-Notifications-4A90E2?labelColor=1b1f24)]()
[![React Joyride](https://img.shields.io/badge/react--joyride-Tutorials%20%26%20Walkthroughs-FF6F61?labelColor=1b1f24)]()
---

## Overview

Welcome to the **IDEA Project**! This platform turns raw educational data into interactive, meaningful insights for educators and learners. Powered by **OpenLAP**, the app offers customizable dashboards, visualizations, and seamless collaboration.

---

## Web Architecture

**Key highlights**
- **Frontend:** React.js for an intuitive and dynamic interface  
- **Backend:** Node.js & Express for robust APIs and core logic  
- **Database:** MongoDB for secure, efficient data storage  
- **Authentication:** JWT for stateless, secure sessions  
- **Visualization:** Chart.js & D3.js for crisp, interactive charts  
- **State Management:** Redux (RTK) to manage global state  
- **HTTP Requests:** Axios for API communication  
- **Styling:** Material-UI or TailwindCSS for a modern UI  

### Architecture Diagram 
```
+------------------+            HTTPS (JWT)             +---------------------+         ODM         +------------------+
|  React Frontend  | <--------------------------------> |  Express API Layer  | <-----------------> |     MongoDB      |
|  (Vite, MUI/TW)  |   Axios requests / JSON responses  |  (Node.js)          |   Mongoose models   |  (Users, Dashboards,
|                  |                                     |                     |                    |   Datasets, etc.) |
+---------+--------+                                     +----------+----------+                    +---------+--------+
          |  Redux store (global state)                             |  AuthN/AuthZ (JWT)
          |  Notistack (toasts)                                     |  Validation, routing
          |  Shepherd.js (guided tours)                             |  Business logic
          |  Chart.js/D3 (viz)                                      |  CRUD endpoints
          v                                                         v
   UI components & pages                                    Controllers / Services
```
---

## Core Libraries & Frameworks

- React.js  
- Redux & Redux Toolkit  
- Axios  
- Chart.js / D3.js  
- Express.js  
- MongoDB & Mongoose  
- JSON Web Token (JWT)  
- Material-UI / TailwindCSS  

### Additional Libraries & Tools
- **React Router** (routing)  
- **notistack** (toast notifications)  
- **Shepherd.js** (guided walkthroughs)  
- **dayjs** (dates & time)  
- **ESLint + Prettier** (linting & formatting)  
- **Vite** (fast dev/build)  
- **Jest / React Testing Library** (testing)

---

## Project Screenshots

> *screenshots of dashboard and visualizations here.**  
> `![Dashboard Screenshot](./docs/images/screenshot-1.png)`  
> `![Visualization Screenshot](./docs/images/screenshot-2.png)`

---

## Meet the Team

| Name                    |
|-------------------------|
| Kaustubh Barbudhe       |
| Tyler Schümchen         |
| Shivangi Lathiya        |
| Hasti Lathiya           |
| Daniela Ortiz Cando     |
| Lydie Njike Kamdoum     |
| Kai Klöttschen          |

---

## Project Kanban Board

Track our progress: **[GitHub Project Board](https://github.com/users/im-kaustubh/projects/9/views/1)**

---

## Live Demo Screencast

> **YouTube demo link **  
> `https://youtu.be/0VOmd1Na9N0`

---

## Advertisement Video

> Advertisement video link
> **[Click here](https://youtu.be/gd2QOi8TlXs)**
> 

---

