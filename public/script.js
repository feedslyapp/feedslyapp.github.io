document.addEventListener("DOMContentLoaded", () => {
  // --- Your Google Form Details ---
  const GOOGLE_FORM_URL =
    "https://docs.google.com/forms/d/e/1FAIpQLSdgj_06HEQXVF2qReqZvRtBiTesnyT6nH0doAyn5yysMfuESw/formResponse";
  const SERVICE_NAME_ENTRY_ID = "entry.1566157775";
  const ISSUE_TYPES_ENTRY_ID = "entry.1776921126";
  const DESCRIPTION_ENTRY_ID = "entry.1021415286";
  // -------------------------------------------

  const servicesGrid = document.getElementById("services-grid");
  const searchInput = document.getElementById("search-input");
  const themeToggle = document.getElementById("theme-toggle");
  const modalOverlay = document.getElementById("report-modal-overlay");
  const modalContent = document.getElementById("report-modal-content");
  let allServicesData = [];

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
    const padding = 5;
    const actualMin = Math.min(...reports);
    const actualMax = Math.max(...reports);
    const scaleMax =
      actualMin === actualMax ? actualMax * 2 || 2 : actualMax;
    const points = reports
      .map((report, i) => {
        const x = (i / (reports.length - 1)) * width;
        const ratio = scaleMax > 0 ? report / scaleMax : 0;
        const y = height - (ratio * (height - padding * 2) + padding);
        return `${x},${y}`;
      })
      .join(" ");
    return `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none"><polyline class="graph-line ${statusClass}" points="${points}" /></svg>`;
  };

  // --- Rendering Logic (with data attributes for modal) ---
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
      // Add data attributes to store service name and id
      card.dataset.name = service.name;
      card.dataset.id = service.id;
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
      const response = await fetch("/api/services");
      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
      const services = await response.json();
      allServicesData = services;
      renderServices(allServicesData);
    } catch (error) {
      console.error("Failed to fetch services:", error);
      servicesGrid.innerHTML = `<p class="error">Could not load service data. Please try again later.</p>`;
    }
  };

  // --- MODAL LOGIC ---
  const openModal = (serviceName) => {
    modalContent.innerHTML = `
      <h3>Are you having an issue with ${serviceName} currently?</h3>
      <div class="modal-buttons">
        <button id="report-yes" class="modal-button yes">Yes, I am.</button>
        <button id="report-no" class="modal-button no">No, I am not.</button>
      </div>
    `;
    modalOverlay.classList.add("visible");

    document.getElementById("report-no").addEventListener("click", closeModal);
    document
      .getElementById("report-yes")
      .addEventListener("click", () => showReportStepTwo(serviceName));
  };

  const showReportStepTwo = (serviceName) => {
    modalContent.innerHTML = `
      <h3>What issues are you experiencing with ${serviceName}?</h3>
      <form id="report-form" class="report-form-step">
        <div class="checkbox-group">
          <label>Type of Issue (select all that apply):</label>
          <div class="checkbox-options">
            <label><input type="checkbox" value="Login"> Login</label>
            <label><input type="checkbox" value="Site Access"> Site Access</label>
            <label><input type="checkbox" value="Slow Speeds"> Slow Speeds</label>
            <label><input type="checkbox" value="API Errors"> API Errors</label>
            <label><input type="checkbox" value="Sending/Receiving"> Sending/Receiving</label>
            <label><input type="checkbox" value="Other"> Other</label>
          </div>
        </div>
        <div class="textarea-group">
          <label for="description">Optional: Describe the issue</label>
          <textarea id="description" placeholder="e.g., I can't log in with my Google account."></textarea>
        </div>
        <div class="modal-buttons">
          <button type="submit" class="modal-button yes">Submit Report</button>
        </div>
      </form>
    `;

    document
      .getElementById("report-form")
      .addEventListener("submit", (e) => handleFormSubmit(e, serviceName));
  };

  const handleFormSubmit = async (e, serviceName) => {
    e.preventDefault();
    const form = e.target;
    const selectedIssues = Array.from(
      form.querySelectorAll('input[type="checkbox"]:checked')
    ).map((cb) => cb.value);
    const description = form.querySelector("#description").value;

    const formData = new FormData();
    formData.append(SERVICE_NAME_ENTRY_ID, serviceName);
    formData.append(ISSUE_TYPES_ENTRY_ID, selectedIssues.join(", "));
    formData.append(DESCRIPTION_ENTRY_ID, description);

    try {
      await fetch(GOOGLE_FORM_URL, {
        method: "POST",
        body: formData,
        mode: "no-cors", // Important: Google Forms doesn't support CORS
      });
      modalContent.innerHTML = `<h3>Thank you!</h3><p style="text-align:center;">Your report has been submitted.</p>`;
    } catch (error) {
      console.error("Form submission error:", error);
      modalContent.innerHTML = `<h3>Error</h3><p style="text-align:center;">Could not submit your report. Please try again later.</p>`;
    } finally {
      setTimeout(closeModal, 2500); // Close modal after a delay
    }
  };

  const closeModal = () => {
    modalOverlay.classList.remove("visible");
  };

  // Event listener for opening the modal (using event delegation)
  servicesGrid.addEventListener("click", (e) => {
    const card = e.target.closest(".service-card");
    if (card && card.dataset.name) {
      openModal(card.dataset.name);
    }
  });

  // Event listeners for closing the modal
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      closeModal();
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalOverlay.classList.contains("visible")) {
      closeModal();
    }
  });

  // --- Initial Load ---
  fetchAndRenderServices();
});
