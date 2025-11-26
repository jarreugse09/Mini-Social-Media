require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../src/models/userModel");

function normalizeConnectionString(cs) {
  if (!cs || typeof cs !== "string") return cs;
  if (cs.startsWith("mongodb+srv://")) {
    const idx = cs.indexOf("/", cs.indexOf("@"));
    if (idx === -1) {
      if (cs.includes("?")) return cs.replace("?", "/mini-social?");
      return cs + "/mini-social";
    }
    const pathPart = cs.slice(idx);
    if (pathPart === "/" || pathPart.startsWith("/?")) {
      if (pathPart.startsWith("/?")) return cs.replace("/?", "/mini-social?");
      return cs.replace("/", "/mini-social");
    }
  }
  return cs;
}

const rawConnection =
  process.env.CONNECTION_STRING || "mongodb://localhost:27017/mini-social";
const connectionString = normalizeConnectionString(rawConnection);

async function run() {
  try {
    console.log(
      "Connecting to",
      connectionString.replace(/:(.*?)@/, ":*****@")
    );
    await mongoose.connect(connectionString, {});
    console.log("Connected to MongoDB");

    const users = [
      { username: "JomsDev", password: "password123", role: "admin" },
      { username: "Alice", password: "alicepass", role: "poster" },
      { username: "Bob", password: "bobpass", role: "commenter" },
      { username: "Charlie", password: "charliepass", role: "reactor" },
      { username: "Dave", password: "davepass", role: "user" },
      { username: "Eve", password: "evepass", role: "user" },
      { username: "Frank", password: "frankpass", role: "poster" },
      { username: "Grace", password: "gracepass", role: "reactor" },
      { username: "Hannah", password: "hannahpass", role: "commenter" },
      { username: "Ian", password: "ianpass", role: "user" },
      { username: "Jack", password: "jackpass", role: "poster" },
      { username: "Karen", password: "karenpass", role: "reactor" },
      { username: "Leo", password: "leopass", role: "user" },
      { username: "Mia", password: "miapass", role: "commenter" },
      { username: "Nina", password: "ninapass", role: "user" },
      { username: "Oscar", password: "oscarpass", role: "reactor" },
      { username: "Paul", password: "paulpass", role: "poster" },
      { username: "Quinn", password: "quinnpass", role: "user" },
      { username: "Rachel", password: "rachelpass", role: "commenter" },
      { username: "Steve", password: "stevepass", role: "user" },
    ];

    for (const u of users) {
      const existing = await User.findOne({ username: u.username });
      if (existing) {
        console.log(`Skipping ${u.username} (already exists)`);
        continue;
      }
      const hashed = await bcrypt.hash(u.password, 10);
      const created = await User.create({
        username: u.username,
        password: hashed,
        role: u.role,
      });
      console.log(`Created user: ${created.username} (${created.role})`);
    }

    console.log("Seeding complete");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Seeder error:", err && err.message ? err.message : err);
    if (err && err.message && err.message.toLowerCase().includes("bad auth")) {
      console.error(
        "Authentication failed. Check CONNECTION_STRING, username/password, and IP whitelist in Atlas."
      );
    }
    process.exit(1);
  }
}

run();
