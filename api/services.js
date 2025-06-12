// This is a Vercel Serverless Function
// It will live at the endpoint /api/services

// Helper function to generate a plausible report history based on status
const generateReportsFromStatus = (status) => {
  switch (status) {
    case "critical":
    case "major":
      // High numbers for a major outage
      return Array.from(
        { length: 10 },
        () => 300 + Math.floor(Math.random() * 700)
      );
    case "minor":
      // Medium numbers for a partial outage
      return Array.from(
        { length: 10 },
        () => 50 + Math.floor(Math.random() * 100)
      );
    case "none":
    default:
      // Low numbers for operational status
      return Array.from(
        { length: 10 },
        () => 1 + Math.floor(Math.random() * 15)
      );
  }
};

// Define all the services we want to monitor
const servicesToMonitor = [
  {
    id: "cloudflare",
    name: "Cloudflare",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Cloudflare_logo.svg",
    apiUrl: "https://www.cloudflarestatus.com/api/v2/summary.json",
  },
  {
    id: "discord",
    name: "Discord",
    logo: "https://logowik.com/content/uploads/images/discord-new-20218785.jpg",
    apiUrl: "https://discordstatus.com/api/v2/summary.json",
  },
  {
    id: "github",
    name: "GitHub",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/c2/GitHub_Invertocat_Logo.svg",
    apiUrl: "https://www.githubstatus.com/api/v2/summary.json",
  },
  // --- Services without a simple public API (we'll simulate them) ---
  {
    id: "google",
    name: "Google",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg",
    // No simple API, so we'll use our generator with a default 'none' status
    reports: generateReportsFromStatus("none"),
  },
  {
    id: "x-com",
    name: "X.com (Twitter)",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/57/X_logo_2023_%28white%29.png",
    // Let's simulate a minor issue for demonstration
    reports: generateReportsFromStatus("minor"),
  },
  {
    id: "aws",
    name: "Amazon Web Services",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg",
    reports: generateReportsFromStatus("none"),
  },
];

export default async function handler(request, response) {
  const promises = servicesToMonitor.map(async (service) => {
    // If the service has a real API URL, fetch it
    if (service.apiUrl) {
      try {
        const apiResponse = await fetch(service.apiUrl);
        if (!apiResponse.ok) throw new Error("API fetch failed");
        const data = await apiResponse.json();
        // Translate the real status into a report history for our graph
        const reports = generateReportsFromStatus(data.status.indicator);
        return { ...service, reports };
      } catch (error) {
        console.error(`Failed to fetch status for ${service.name}:`, error);
        // Fallback if the API fails
        return { ...service, reports: generateReportsFromStatus("unknown") };
      }
    }
    // Otherwise, return the service with its pre-defined mock data
    return service;
  });

  // Wait for all fetches to complete
  const results = await Promise.all(promises);

  // Send the final combined data to the frontend
  response.status(200).json(results);
}
