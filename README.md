Mini Social Media – Documentation

A lightweight social media platform built with Node.js, Express, MongoDB Atlas, and vanilla JavaScript. The project includes a role-based permission system, JWT authentication, post interactions (likes/dislikes/comments), and a responsive frontend interface.

📌 Features
User Features
Register & login using JWT authentication
Create, view, update, delete posts
Like & dislike posts (toggle style)
Comment on posts
Delete own comments
Upload images or use external image URLs
Dark & light mode
Responsive UI
Admin Features
Assign user roles
Delete any post or comment
View all users

User Roles
Role	  Create Posts	Comment	React	Delete Own Post	Manage Users
Admin	      ✔	           ✔	    ✔	          ✔	           ✔
Poster	    ✔	           ✔      ✔	        ✔	           ✖
Commenter	  ✖	           ✔	     ✖	        ✖	           ✖
Reactor	    ✖	           ✖	     ✔	        ✖	           ✖
User	      ✖	           ✖	     ✖	        ✖	           ✖

🛠 Tech Stack
Backend
Node.js
Express.js
MongoDB & Mongoose
JWT Authentication
Multer (image uploads)

Frontend
HTML
CSS 
JavaScript (vanilla)
