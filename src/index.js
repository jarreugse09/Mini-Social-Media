const { fileURLToPath } = require("url");
const { dirname, join } = require("path");
const dotenv = require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const checkReferer = require("./middlewares/checkReferer");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const appRoutes = require("./routes/appRoutes");


const app = express();

app.use(
    '/styles',
    checkReferer,
    express.static(join(__dirname, 'styles'))
  );
  
app.use(
  '/scripts',
  checkReferer,
  express.static(join(__dirname, 'scripts'))
);
app.use('/', appRoutes);

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 7002;

mongoose.connect(process.env.CONNECTION_STRING)
    .then(() => console.log("Successfully Connected to MongoDB Atlas"))
    .catch(err => console.error("MongoDB connection error:", err));

app.listen(PORT, () => {
    console.log(`Server is Running at port ${PORT}`);
});
