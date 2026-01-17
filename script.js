const projectsEl = document.getElementById("projects");
document.getElementById("year").textContent = new Date().getFullYear();

async function loadProjects() {
  const res = await fetch("projects/project-data.json");
  const projects = await res.json();

  projectsEl.innerHTML = projects.map((p, idx) => `
    <article class="card" data-idx="${idx}">
      <h3 class="card-title">${escapeHtml(p.title)}</h3>
      <p class="card-desc">${escapeHtml(p.description)}</p>
      <div class="tags">
        ${(p.tags || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("")}
      </div>
      <div class="actions">
        <a href="${p.repoUrl}" target="_blank" rel="noreferrer" onclick="event.stopPropagation()">Repo</a>
        <a href="${p.videoUrl}" target="_blank" rel="noreferrer" onclick="event.stopPropagation()">Video</a>
      </div>
    </article>
  `).join("");

  projectsEl.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", () => {
      const p = projects[Number(card.dataset.idx)];
      openModal(p);
    });
  });
}

function openModal(project) {
  const modal = getOrCreateModal();
  modal.querySelector("h3").textContent = project.title;

  const video = modal.querySelector("video");
  video.src = project.videoUrl;
  video.load();

  modal.classList.add("open");
}

function closeModal() {
  const modal = document.getElementById("modal");
  if (!modal) return;
  const video = modal.querySelector("video");
  video.pause();
  video.src = "";
  modal.classList.remove("open");
}

function getOrCreateModal() {
  let modal = document.getElementById("modal");
  if (modal) return modal;

  modal = document.createElement("div");
  modal.id = "modal";
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content" role="dialog" aria-modal="true">
      <div class="modal-header">
        <h3></h3>
        <button class="close-btn" type="button">Close</button>
      </div>
      <div class="video-wrap">
        <video controls playsinline></video>
      </div>
    </div>
  `;

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  modal.querySelector(".close-btn").addEventListener("click", closeModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  document.body.appendChild(modal);
  return modal;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

loadProjects().catch(err => {
  projectsEl.innerHTML = `<p style="color:#ffb4b4;">Failed to load projects: ${escapeHtml(err.message)}</p>`;
});
