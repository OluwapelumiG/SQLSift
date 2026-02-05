# SQLSift

> **Query without friction.**  
> The ultra-light, in-browser SQL client designed for speed. No drivers, no installs, just pure data exploration.

![SQLSift Dashboard](resources/images/sqlsift-dashboard-mockup.png) *Note: Replace with actual screenshot*

## Overview

**SQLSift** is a high-performance, privacy-first SQL client that runs entirely in your browser. Powered by WebAssembly (WASM), it allows you to sift through CSVs and JSON files using standard SQL queries without ever sending your data to a remote server.

Designed for developers and data analysts who need **precision at scale**.

## Key Features

- **⚡ Zero Setup**: No drivers to install, no connection strings to manage. Just drag, drop, and query.
- **🛡️ Secure by Design**: Your data never leaves your browser. All processing happens locally via WASM.
- **🧠 Schema Intelligence**: Auto-detects column types from your CSV/JSON files.
- **⌨️ Keyboard First**: Built-in Command Palette (`Cmd+K`) for power users.
- **💎 Premium Experience**: Deep Space dark mode, glassmorphism UI, and smooth animations.

## Tech Stack

Built with a modern, high-performance stack:

- **Backend**: [Laravel 10](https://laravel.com)
- **Frontend**: [React](https://react.dev) + [Inertia.js](https://inertiajs.com)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com) (Pure utility-first)
- **Motion**: [Framer Motion](https://www.framer.com/motion/)
- **Editor**: Monaco Editor (VS Code core)

## Installation

### Prerequisites

- PHP 8.2+
- Composer
- Node.js 20+ & NPM

### Setup Guide

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/sqlsift.git
   cd sqlsift
   ```

2. **Install Backend Dependencies**
   ```bash
   composer install
   ```

3. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

4. **Environment Setup**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Database Setup** (For user authentication settings)
   ```bash
   touch database/database.sqlite
   php artisan migrate
   ```

6. **Start Development Servers**
   Open two terminal tabs:

   *Tab 1 (Vite)*:
   ```bash
   npm run dev
   ```

   *Tab 2 (Laravel)*:
   ```bash
   php artisan serve
   ```

7. **Launch**
   Visit `http://localhost:8000` in your browser.

## License

SQLSift is open-source software licensed under the [MIT license](https://opensource.org/licenses/MIT).
