document.addEventListener("DOMContentLoaded", () => {
  const servicesGrid = document.getElementById("services-grid");
  const searchInput = document.getElementById("search-input");
  const themeToggle = document.getElementById("theme-toggle");
  let allServicesData = []; // To store data for searching

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

  // --- THIS FUNCTION IS UPDATED ---
  const generateGraphSVG = (reports, statusClass) => {
    const width = 300;
    const height = 80;
    const padding = 5; // Vertical padding from top and bottom

    const actualMin = Math.min(...reports);
    const actualMax = Math.max(...reports);

    // If the line is flat, we adjust the scale to center it.
    // Otherwise, we use the actual max value for bumpy lines.
    const scaleMax =
      actualMin === actualMax ? actualMax * 2 || 2 : actualMax;

    const points = reports
      .map((report, i) => {
        const x = (i / (reports.length - 1)) * width;
        // Avoid division by zero if scaleMax is 0
        const ratio = scaleMax > 0 ? report / scaleMax : 0;
        const y = height - (ratio * (height - padding * 2) + padding);
        return `${x},${y}`;
      })
      .join(" ");

    return `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none"><polyline class="graph-line ${statusClass}" points="${points}" /></svg>`;
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
    const filteredServices = allServicesData.filter((service) =>
      service.name.toLowerCase().includes(searchTerm)
    );
    renderServices(filteredServices);
  });

  // --- Data Fetching Logic ---
  const fetchAndRenderServices = async () => {
    try {
      // The loader is now part of the initial HTML
      const response = await fetch("/api/services");
      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }
      const services = await response.json();
      allServicesData = services; // Save data for searching
      renderServices(allServicesData);
    } catch (error) {
      console.error("Failed to fetch services:", error);
      servicesGrid.innerHTML = `<p class="error">Could not load service data. Please try again later.</p>`;
    }
  };

  // --- Initial Load ---
  fetchAndRenderServices();
});
