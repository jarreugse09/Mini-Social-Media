# Mini Social Media

A lightweight social media platform built with **Node.js**, **Express**, **MongoDB Atlas**, and **vanilla JavaScript**.  
The application supports role-based permissions, JWT authentication, post interactions (likes, dislikes, comments), image uploads, and a responsive frontend.

---

## Features

### **User Features**
- Register & login using **JWT authentication**
- Create, view, update, delete posts
- Like & dislike posts (toggle)
- Comment on posts
- Delete own comments
- Upload images or use external image URLs
- Dark & light mode
- Responsive design

### **Admin Features**
- Assign roles to users
- Delete any post or comment
- View all registered users

### **User Roles & Permissions**

| Role       | Create Posts | Comment | React (Like/Dislike) | Delete Own Post | Manage Users |
|------------|-------------|--------|---------------------|----------------|-------------|
| **Admin**  | ✅           | ✅      | ✅                   | ✅              | ✅           |
| **Poster** | ✅           | ✅      | ✅                   | ✅              | ❌           |
| **Commenter** | ❌        | ✅      | ❌                   | ❌              | ❌           |
| **Reactor** | ❌          | ❌      | ✅                   | ❌              | ❌           |
| **User**   | ❌           | ❌      | ❌                   | ❌              | ❌           |

---

## Tech Stack

### **Backend**
- **Node.js**
- **Express.js**
- **MongoDB & Mongoose**
- **JWT Authentication**
- **Multer** (for image uploads)

### **Frontend**
- HTML5
- CSS3
- Vanilla JavaScript

---

## Installation & Setup

### **Prerequisites**
- Node.js v14+
- MongoDB Atlas account (or local MongoDB)
- Git

### **Steps**
1. Clone the repository:
```bash
git clone https://github.com/yourusername/Mini-Social-Media.git
cd Mini-Social-Media
```
2. Install dependencies:
```bash
npm install
```
3. Copy .env.example to .env and configure your environment variables:
```bash
PORT=7002
CONNECTION_STRING=mongodb+srv://username:password@cluster.mongodb.net/mini-social
NODE_ENV=development
```
4. Seed the database (optional):
```
node scripts/seedPosts.js
```

5. Run the application:
```
npm start
```
Access the app at: http://localhost:7002
