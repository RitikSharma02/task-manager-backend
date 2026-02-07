# Task Manager Backend

This is a Node.js + TypeScript backend for a Task Manager Application.

## Prerequisites

- Node.js (v18+)
- npm (v9+)

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Database Setup**
   Initialize the SQLite database:
   ```bash
   npx prisma migrate dev --name init
   ```
   This will create a `dev.db` file in the `prisma` folder.

3. **Start the Server**
   
   Development mode:
   ```bash
   npm run dev
   ```

   Production build:
   ```bash
   npm run build
   npm start
   ```

   The server will run on `http://localhost:3000`.

4. **Start the DB Studio**
   ```bash
   npx prisma studio -p 5556
   ```
   The studio will run on `http://localhost:5556`.

   *(Optional) To update Prisma:*
   ```bash
   npm i --save-dev prisma@latest 
   npm i @prisma/client@latest 
   ``` 

## API Endpoints

### Authentication
- `POST /auth/register`: Register a new user (`email`, `password`)
- `POST /auth/login`: Login (`email`, `password`) -> Returns `accessToken` & `refreshToken`
- `POST /auth/refresh`: Get new tokens (`refreshToken`)
- `POST /auth/logout`: Logout

### Tasks
All task endpoints require `Authorization: Bearer <access_token>` header.

- `GET /tasks`: Get tasks (Query params: `page`, `limit`, `status`, `search`)
- `POST /tasks`: Create task (`title`, `description`)
- `GET /tasks/:id`: Get task by ID
- `PATCH /tasks/:id`: Update task
- `DELETE /tasks/:id`: Delete task
- `PATCH /tasks/:id/toggle`: Toggle task status (PENDING <-> COMPLETED)

## Project Structure
- `src/app.ts`: Express app configuration
- `src/controllers`: Request handlers
- `src/middlewares`: Auth and Error handling
- `src/routes`: API definitions
- `src/utils`: Helpers (Prisma, JWT)
