const projectsGrid = document.getElementById("projectsGrid");
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

document.getElementById("year").textContent = new Date().getFullYear();

document.getElementById("themeBtn").addEventListener("click", () => {
  document.body.classList.toggle("light");
  document.getElementById("themeBtn").textContent =
    document.body.classList.contains("light") ? "🌙" : "☀";
});

document.getElementById("menuBtn").addEventListener("click", () => {
  document.getElementById("nav").classList.toggle("open");
});

document.querySelectorAll("#nav a").forEach(link => {
  link.addEventListener("click", () => document.getElementById("nav").classList.remove("open"));
});

function projectCard(project) {
  const technologies = (project.technologies || [])
    .map(t => `<span>${escapeHtml(t)}</span>`)
    .join("");

  return `
    <article class="project-card">
      <img src="${escapeAttr(project.image || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80")}" alt="${escapeAttr(project.title)}">
      <div class="project-body">
        <div class="project-top">
          <h3>${escapeHtml(project.title)}</h3>
          ${project.featured ? "<span class='featured'>Featured</span>" : ""}
        </div>
        <p>${escapeHtml(project.description)}</p>
        <div class="tech-list">${technologies}</div>
        <div class="project-links">
          ${project.github ? `<a href="${escapeAttr(project.github)}" target="_blank" rel="noopener">GitHub ↗</a>` : ""}
          ${project.demo ? `<a href="${escapeAttr(project.demo)}" target="_blank" rel="noopener">Live Demo ↗</a>` : ""}
        </div>
      </div>
    </article>`;
}

async function loadProjects() {
  try {
    const response = await fetch(`${API_BASE_URL}/projects`);
    if (!response.ok) throw new Error("Could not load projects");
    const projects = await response.json();

    projectsGrid.innerHTML = projects.length
      ? projects.map(projectCard).join("")
      : "<p>No projects found. Add projects to MongoDB first.</p>";
  } catch (error) {
    projectsGrid.innerHTML = `<p class="error">Backend is not connected. Start the Node.js server and check API_BASE_URL.</p>`;
  }
}

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  formStatus.textContent = "Sending...";

  const payload = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    message: document.getElementById("message").value.trim()
  };

  try {
    const response = await fetch(`${API_BASE_URL}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Message failed");
    formStatus.textContent = "Message sent successfully!";
    contactForm.reset();
  } catch (error) {
    formStatus.textContent = "Could not send message. Please try again.";
  }
});

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[c]));
}

function escapeAttr(value) {
  return escapeHtml(value);
}

loadProjects();
