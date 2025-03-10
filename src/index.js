const express = require("express");
const dotenv = require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

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
