document.addEventListener("DOMContentLoaded", () => {
  const servicesGrid = document.getElementById("services-grid");
  const searchInput = document.getElementById("search-input");
  const themeToggle = document.getElementById("theme-toggle");

  // --- Theme Management ---
  const applyTheme = (isDarkMode) => {
    document.body.classList.toggle("dark-mode", isDarkMode);
    themeToggle.checked = isDarkMode;
  };

  const savedTheme = localStorage.getItem("darkMode") === "true";
  applyTheme(savedTheme);

  themeToggle.addEventListener("change", (e) => {
    const isDarkMode = e.target.checked;
    localStorage.setItem("darkMode", isDarkMode);
    applyTheme(isDarkMode);
  });

  // --- Status & Graph Logic ---
  const getServiceStatus = (reports) => {
    const maxReports = Math.max(...reports);
    if (maxReports > 200) return { level: "critical", text: "Major Outage" };
    if (maxReports > 50) return { level: "warning", text: "Possible Issues" };
    return { level: "ok", text: "No Issues Reported" };
  };

  const generateGraphSVG = (reports, statusClass) => {
    const width = 300;
    const height = 80;
    const maxReport = Math.max(...reports, 1); // Avoid division by zero
    const points = reports
      .map(
        (report, i) =>
          `${(i / (reports.length - 1)) * width},${
            height - (report / maxReport) * (height - 5) - 5
          }`
      )
      .join(" ");

    return `
      <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
        <polyline class="graph-line ${statusClass}" points="${points}" />
      </svg>
    `;
  };

  // --- Rendering Logic ---
  const renderServices = (services) => {
    servicesGrid.innerHTML = "";
    if (services.length === 0) {
      servicesGrid.innerHTML = `<p class="no-results">No services found.</p>`;
      return;
    }

    services.forEach((service) => {
      const status = getServiceStatus(service.reports);
      const card = document.createElement("div");
      card.className = "service-card";
      card.innerHTML = `
        <div class="card-header">
          <img src="${service.logo}" alt="${service.name} Logo" class="service-logo">
          <h2 class="service-name">${service.name}</h2>
        </div>
        <div class="graph-container">
          ${generateGraphSVG(service.reports, `status-${status.level}`)}
        </div>
        <p class="status-text ${status.level}">${status.text}</p>
      `;
      servicesGrid.appendChild(card);
    });
  };

  // --- Search Logic ---
  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredServices = mockServicesData.filter((service) =>
      service.name.toLowerCase().includes(searchTerm)
    );
    renderServices(filteredServices);
  });

  // --- Initial Render ---
  renderServices(mockServicesData);
});
