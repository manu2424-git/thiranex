const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, default: "" },
  technologies: [{ type: String }],
  github: { type: String, default: "" },
  demo: { type: String, default: "" },
  featured: { type: Boolean, default: false }
}, { timestamps: true });

const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String
}, { timestamps: true });

const Project = mongoose.model("Project", projectSchema);
const Contact = mongoose.model("Contact", contactSchema);

function adminOnly(req, res, next) {
  if (!process.env.ADMIN_KEY || req.header("x-admin-key") !== process.env.ADMIN_KEY) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Portfolio API is running" });
});

app.get("/api/projects", async (req, res) => {
  try {
    const projects = await Project.find().sort({ featured: -1, createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/projects", adminOnly, async (req, res) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put("/api/projects/:id", adminOnly, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete("/api/projects/:id", adminOnly, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post("/api/projects/seed", adminOnly, async (req, res) => {
  try {
    const count = await Project.countDocuments();
    if (count > 0) return res.json({ message: "Projects already exist", count });

    const projects = await Project.insertMany([
      {
        title: "AI Video Learning Assistant",
        description: "Interactive video learning platform that helps learners understand vocabulary without interrupting video playback.",
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
        technologies: ["HTML", "CSS", "JavaScript", "AI"],
        github: "https://github.com/",
        demo: "https://example.com/",
        featured: true
      },
      {
        title: "Smart Budget Tracker",
        description: "Student-friendly budget application for tracking income, expenses, savings and spending insights.",
        image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=900&q=80",
        technologies: ["HTML", "CSS", "JavaScript"],
        github: "https://github.com/",
        demo: "https://example.com/",
        featured: true
      },
      {
        title: "Career Guidance Chatbot",
        description: "A conversational career guidance interface that recommends learning paths based on user interests.",
        image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=900&q=80",
        technologies: ["JavaScript", "Node.js", "AI"],
        github: "https://github.com/",
        demo: "https://example.com/",
        featured: false
      }
    ]);

    res.status(201).json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }
    await Contact.create({ name, email, message });
    res.status(201).json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn("MONGODB_URI is not configured. API will not connect to MongoDB.");
    } else {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("MongoDB connected");
    }

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Startup error:", error.message);
    process.exit(1);
  }
}

start();
