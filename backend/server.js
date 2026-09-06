const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const XLSX = require("xlsx");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


// ===============================
// PROJECT SCHEMA
// ===============================

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },

    description: {
      type: String,
      required: true
    },

    image: {
      type: String,
      default: ""
    },

    technologies: [
      {
        type: String
      }
    ],

    github: {
      type: String,
      default: ""
    },

    demo: {
      type: String,
      default: ""
    },

    featured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);


// ===============================
// CONTACT SCHEMA
// ===============================

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true
    },

    message: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);


// ===============================
// MODELS
// ===============================

const Project = mongoose.model("Project", projectSchema);

const Contact = mongoose.model("Contact", contactSchema);


// ===============================
// ADMIN AUTHENTICATION
// ===============================

function adminOnly(req, res, next) {
  if (
    !process.env.ADMIN_KEY ||
    req.header("x-admin-key") !== process.env.ADMIN_KEY
  ) {
    return res.status(401).json({
      message: "Unauthorized"
    });
  }

  next();
}


// ===============================
// HEALTH CHECK
// ===============================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Portfolio API is running"
  });
});


// ===============================
// GET ALL PROJECTS
// ===============================

app.get("/api/projects", async (req, res) => {
  try {
    const projects = await Project.find().sort({
      featured: -1,
      createdAt: -1
    });

    res.json(projects);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});


// ===============================
// ADD PROJECT
// ===============================

app.post("/api/projects", adminOnly, async (req, res) => {
  try {
    const project = await Project.create(req.body);

    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});


// ===============================
// UPDATE PROJECT
// ===============================

app.put("/api/projects/:id", adminOnly, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    res.json(project);
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});


// ===============================
// DELETE PROJECT
// ===============================

app.delete("/api/projects/:id", adminOnly, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    res.json({
      success: true,
      message: "Project deleted successfully"
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});


// ===============================
// SEED SAMPLE PROJECTS
// ===============================

app.post("/api/projects/seed", adminOnly, async (req, res) => {
  try {
    const count = await Project.countDocuments();

    if (count > 0) {
      return res.json({
        message: "Projects already exist",
        count
      });
    }

    const projects = await Project.insertMany([
      {
        title: "AI Video Learning Assistant",

        description:
          "Interactive video learning platform that helps learners understand vocabulary without interrupting video playback.",

        image:
          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",

        technologies: [
          "HTML",
          "CSS",
          "JavaScript",
          "AI"
        ],

        github: "https://github.com/",

        demo: "https://example.com/",

        featured: true
      },

      {
        title: "Smart Budget Tracker",

        description:
          "Student-friendly budget application for tracking income, expenses, savings and spending insights.",

        image:
          "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=900&q=80",

        technologies: [
          "HTML",
          "CSS",
          "JavaScript"
        ],

        github: "https://github.com/",

        demo: "https://example.com/",

        featured: true
      },

      {
        title: "Career Guidance Chatbot",

        description:
          "A conversational career guidance interface that recommends learning paths based on user interests.",

        image:
          "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=900&q=80",

        technologies: [
          "JavaScript",
          "Node.js",
          "AI"
        ],

        github: "https://github.com/",

        demo: "https://example.com/",

        featured: false
      }
    ]);

    res.status(201).json(projects);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});


// ===============================
// CONTACT FORM
// ===============================

app.post("/api/contact", async (req, res) => {
  try {

    const {
      name,
      email,
      message
    } = req.body;


    // Check required fields

    if (!name || !email || !message) {

      return res.status(400).json({
        message: "All fields are required"
      });

    }


    // Save contact message to MongoDB

    const contact = await Contact.create({
      name,
      email,
      message
    });


    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      contactId: contact._id
    });


  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
});


// ===============================
// GET CONTACT MESSAGES
// ===============================

app.get("/api/contact", adminOnly, async (req, res) => {

  try {

    const contacts = await Contact.find()
      .sort({
        createdAt: -1
      });

    res.json(contacts);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});


// ===============================
// EXPORT CONTACT MESSAGES TO EXCEL
// ===============================

app.get(
  "/api/contact/export",
  adminOnly,
  async (req, res) => {

    try {

      // Get all contact messages

      const contacts = await Contact.find()
        .sort({
          createdAt: -1
        })
        .lean();


      // Convert MongoDB data to Excel data

      const data = contacts.map((contact) => ({

        Name: contact.name,

        Email: contact.email,

        Message: contact.message,

        Date: contact.createdAt
          ? new Date(contact.createdAt)
              .toLocaleString()
          : ""

      }));


      // Create Excel worksheet

      const worksheet =
        XLSX.utils.json_to_sheet(data);


      // Create Excel workbook

      const workbook =
        XLSX.utils.book_new();


      // Add worksheet to workbook

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Contact Messages"
      );


      // Create Excel file

      const excelBuffer =
        XLSX.write(workbook, {
          type: "buffer",
          bookType: "xlsx"
        });


      // Tell browser to download file

      res.setHeader(
        "Content-Disposition",
        'attachment; filename="contact-messages.xlsx"'
      );


      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );


      // Send Excel file

      res.send(excelBuffer);


    } catch (error) {

      res.status(500).json({
        message: error.message
      });

    }

  }
);


// ===============================
// START SERVER
// ===============================

const PORT =
  process.env.PORT || 5000;


async function start() {

  try {

    if (!process.env.MONGODB_URI) {

      console.warn(
        "MONGODB_URI is not configured. API will not connect to MongoDB."
      );

    } else {

      await mongoose.connect(
        process.env.MONGODB_URI
      );

      console.log(
        "MongoDB connected"
      );

    }


    app.listen(
      PORT,
      () => {

        console.log(
          `Server running on http://localhost:${PORT}`
        );

      }
    );


  } catch (error) {

    console.error(
      "Startup error:",
      error.message
    );

    process.exit(1);

  }

}


start();