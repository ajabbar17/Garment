# Aesthetic Online Garment Store

This is a full-stack academic prototype of an e-commerce website built with Vanilla HTML, CSS, JavaScript, and a Node.js Express backend using local JSON storage.

## Features
- **Minimalist Aesthetic**: Clean UI/UX with a neutral color palette.
- **Product Management**: Browse featured and all garments.
- **Shopping Cart**: Session-based cart with quantity updates and removal.
- **Checkout**: Simulated checkout process with order persistence.
- **Admin Panel**: Dashboard for managing products and viewing orders.
  - **Login Credentials**: `admin` / `admin123`
- **JSON Storage**: All data is stored in `data.json` on the local filesystem.

## Prerequisites
- **Node.js**: Version 18 or higher.
- **npm**: Installed with Node.js.

## Local Setup Instructions

1. **Extract/Download**: Download the project files to a folder on your machine.
2. **Install Dependencies**: Open your terminal/command prompt in the project root directory and run:
   ```bash
   npm install
   ```
3. **Run the Application**:
   ```bash
   npm run dev
   ```
4. **Access the Website**: Open your browser and navigate to `http://localhost:5000`.

## Folder Structure
- `client/`: Frontend assets (HTML, CSS, Vanilla JS).
- `server/`: Express backend, routes, and JSON storage logic.
- `shared/`: Shared TypeScript schemas (Zod).
- `data.json`: The local database file (generated on first run).
- `package.json`: Project dependencies and scripts.

## Key Technical Decisions
- **MPA to SPA**: The app uses a single `index.html` with client-side routing to ensure a smooth transition between views while maintaining a vanilla JS stack.
- **Session Storage**: Uses `express-session` with a memory store for managing the cart and admin authentication during the session.
