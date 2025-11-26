const { join } = require("path");
const path = require("path");
const dotenv = require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const checkReferer = require("./middlewares/checkReferer");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const appRoutes = require("./routes/appRoutes");
const postsRouter = require("./controllers/postControllers");

const app = express();

app.use("/styles", checkReferer, express.static(join(__dirname, "styles")));

app.use("/scripts", checkReferer, express.static(join(__dirname, "scripts")));

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/", appRoutes);

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postsRouter);

const PORT = process.env.PORT || 7002;

mongoose
  .connect(normalizeConnectionString(process.env.CONNECTION_STRING), {})
  .then(() => console.log("Successfully Connected to MongoDB"))
  .catch((err) => {
    console.error(
      "MongoDB connection error:",
      err && err.message ? err.message : err
    );
    // Provide actionable guidance without printing secrets
    if (err && err.message && err.message.toLowerCase().includes("bad auth")) {
      console.error(
        "Authentication failed when connecting to MongoDB Atlas. Possible causes:"
      );
      console.error(" - Wrong username or password in CONNECTION_STRING");
      console.error(
        " - Password contains special characters that need URL-encoding (use encodeURIComponent)"
      );
      console.error(
        " - The user does not have privileges for the target database"
      );
      console.error(
        " - Try adding a database name to the URI path (e.g. /mini-social)"
      );
    }
    process.exit(1);
  });

function normalizeConnectionString(cs) {
  if (!cs || typeof cs !== "string") return cs;

  // If using mongodb+srv and the URI does not contain a database name, append a default DB
  if (cs.startsWith("mongodb+srv://")) {
    const idx = cs.indexOf("/", cs.indexOf("@"));
    if (idx === -1) {
      if (cs.includes("?")) return cs.replace("?", "/mini-social?");
      return cs + "/mini-social";
    }

    const pathPart = cs.slice(idx); // includes leading '/'
    if (pathPart === "/" || pathPart.startsWith("/?")) {
      if (pathPart.startsWith("/?")) return cs.replace("/?", "/mini-social?");
      return cs.replace("/", "/mini-social");
    }
  }

  return cs;
}

const rawConnection = process.env.CONNECTION_STRING;
if (!rawConnection) {
  console.error(
    "ERROR: CONNECTION_STRING not set in environment. Create a .env file from .env.example and set CONNECTION_STRING."
  );
  process.exit(1);
}

const connectionString = normalizeConnectionString(rawConnection);
if (connectionString !== rawConnection) {
  console.log(
    "Normalized MongoDB connection string to include a default DB name (mini-social). If you prefer a different DB, update your CONNECTION_STRING."
  );
}

app.listen(PORT, () => {
  console.log(`Server is Running at port ${PORT}`);
});
