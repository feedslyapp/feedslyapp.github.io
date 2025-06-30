document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Element References ---
  const consoleItems = document.querySelectorAll(".console-item");
  const loadRomButton = document.getElementById("load-rom-button");
  const romInput = document.getElementById("rom-input");
  const fullscreenButton = document.getElementById("fullscreen-button");
  const gameInfo = document.getElementById("game-info");
  const welcomeMessage = document.getElementById("welcome-message");
  const gameCanvas = document.getElementById("game-canvas");
  const gameViewport = document.getElementById("game-viewport");

  let selectedConsole = "SNES"; // Default selected console

  // --- Event Listeners ---

  // Handle console selection in the sidebar
  consoleItems.forEach((item) => {
    item.addEventListener("click", () => {
      // Remove active class from all items
      consoleItems.forEach((i) => i.classList.remove("active"));
      // Add active class to the clicked item
      item.classList.add("active");
      selectedConsole = item.dataset.console;
      console.log(`Selected console: ${selectedConsole}`);
      updateWelcomeMessage();
    });
  });

  // Trigger the hidden file input when "Load Game" is clicked
  loadRomButton.addEventListener("click", () => {
    romInput.click();
  });

  // Handle the file selection
  romInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log(`File selected: ${file.name}`);
      gameInfo.textContent = `Loaded: ${file.name}`;
      welcomeMessage.style.display = "none";
      gameCanvas.style.display = "block";

      // =================================================================
      // == THIS IS WHERE YOU WOULD LOAD THE GAME INTO YOUR EMULATOR CORE ==
      // =================================================================
      //
      // Example:
      // const emulator = new Emulator(gameCanvas);
      // const romData = await file.arrayBuffer();
      // emulator.loadRom(romData, selectedConsole);
      // emulator.run();
      //
      // For now, we'll just log a message.
      console.log(
        `Pretending to load "${file.name}" for the ${selectedConsole} core.`,
      );
    }
  });

  // Handle fullscreen request
  fullscreenButton.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      gameViewport.requestFullscreen().catch((err) => {
        alert(
          `Error attempting to enable full-screen mode: ${err.message} (${err.name})`,
        );
      });
    } else {
      document.exitFullscreen();
    }
  });

  // --- Helper Functions ---
  function updateWelcomeMessage() {
    const consoleName =
      document.querySelector(".console-item.active")?.textContent ||
      "a console";
    welcomeMessage.querySelector(
      "p",
    ).textContent = `Select a ${consoleName} game file to begin.`;
  }

  // Initialize the welcome message
  updateWelcomeMessage();
});
