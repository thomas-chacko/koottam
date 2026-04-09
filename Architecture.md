# Koottam - Project Architecture

## Project Overview

Koottam is a full-stack web application built with a modern tech stack, featuring a Next.js frontend and Node.js/Express backend. The project follows a monorepo structure with separate client and server directories.

### Tech Stack

**Frontend (Client)**
- Next.js 16.2.3 with React 19
- TypeScript
- Tailwind CSS 4
- Deployed on Vercel

**Backend (Server)**
- Node.js with Express 5
- JWT Authentication
- Cloudinary Integration
- Rate Limiting & Security Middleware
- Deployed on Render

## Live URLs

- **Frontend**: https://koottam.vercel.app
- **Backend**: https://koottam.onrender.com

## Project Structure

```
koottam/
├── client/                    # Next.js Frontend Application
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   ├── globals.css        # Global styles
│   │   └── favicon.ico        # Favicon
│   ├── public/                # Static assets
│   ├── node_modules/          # Frontend dependencies
│   ├── package.json           # Frontend dependencies & scripts
│   ├── tsconfig.json          # TypeScript configuration
│   ├── next.config.ts         # Next.js configuration
│   ├── postcss.config.mjs     # PostCSS configuration
│   ├── eslint.config.mjs      # ESLint configuration
│   └── README.md              # Client documentation
│
├── server/                    # Express Backend API
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   │   └── env.js         # Environment variables
│   │   ├── controllers/       # Route controllers
│   │   ├── middleware/        # Express middleware
│   │   │   ├── errorHandler.js
│   │   │   └── rateLimiter.js
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── utils/             # Utility functions
│   │   ├── test/              # Test files
│   │   ├── app.js             # Express app setup
│   │   └── index.js           # Server entry point
│   ├── node_modules/          # Backend dependencies
│   ├── package.json           # Backend dependencies & scripts
│   ├── Dockerfile             # Docker configuration
│   ├── .dockerignore          # Docker ignore rules
│   ├── .env                   # Environment variables (local)
│   └── .env.example           # Environment template
│
├── .github/                   # GitHub workflows & configs
├── .vscode/                   # VS Code settings
├── Architecture.md            # Complete Project Architecture
└── README.md                  # Project documentation
```