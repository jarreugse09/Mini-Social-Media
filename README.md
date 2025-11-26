Mini Social Media - Setup and MongoDB Guide

Overview

This project is a minimal social-media-like Express app. It uses Mongoose for models (users/posts) and JWT for authentication.

Quick setup

1. Install dependencies

```powershell
npm install
```

2. Create .env

Copy `.env.example` to `.env` and fill the values. For local MongoDB use `mongodb://localhost:27017/mini-social` or create a free cluster on MongoDB Atlas and put the connection string in `CONNECTION_STRING`.

3. Start the app

```powershell
# development with auto-reload
npm run dev

# or production
npm start
```

MongoDB setup

Option A - Local MongoDB (recommended for development)

- Download and install MongoDB Community Server from https://www.mongodb.com/try/download/community
- Start the MongoDB service (on Windows: the installer sets up a service you can start from Services or run `net start MongoDB`)
- Use connection string: `mongodb://localhost:27017/mini-social`

Option B - MongoDB Atlas (cloud)

- Create an account at https://www.mongodb.com/cloud/atlas
- Create a cluster (Free tier available)
- Create a database user and whitelist your IP (or 0.0.0.0/0 for testing)
- Get the connection string, replace `<username>` and `<password>` and set the database name

Environment variables

- CONNECTION_STRING: MongoDB connection URI
- JWT_SECRET: secret used to sign JWT tokens
- PORT: port to run the server (default 7002)

Notes about fixes applied

- Fixed duplicate/incorrect exports in `src/controllers/authControllers.js`.
- Implemented a proper `Post` model in `src/models/postModel.js`.
- Made `src/middlewares/checkReferer.js` more robust so static assets are not accidentally blocked.
- Removed an erroneous redeclaration of `__filename` / `__dirname` in `src/routes/appRoutes.js`.
- Cleaned unused imports in `src/index.js`.

Next recommended steps

- If you want posts to persist in MongoDB instead of the local `data/posts.json`, we can update `src/controllers/postControllers.js` to use the `Post` model. I can do that for you.
- Add basic tests for auth and posts.

If you want, I can now:

- Wire `postControllers` to MongoDB using the `Post` model and add a small seed script to import `data/posts.json`.
- Start the app in a terminal and show the server logs here.
