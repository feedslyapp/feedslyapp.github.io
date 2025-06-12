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
      // --- THIS IS THE CHANGED LINE ---
      // Before: return Array.from({ length: 10 }, () => 1 + Math.floor(Math.random() * 15));
      // After: Always return 1 for a perfectly flat line.
      return Array.from({ length: 10 }, () => 1);
  }
};

// Define all the services we want to monitor
const servicesToMonitor = [
  {
    id: "cloudflare",
    name: "Cloudflare",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/94/Cloudflare_Logo.png",
    apiUrl: "https://www.cloudflarestatus.com/api/v2/summary.json",
  },
  {
    id: "discord",
    name: "Discord",
    logo: "https://www.svgrepo.com/show/353655/discord-icon.svg",
    apiUrl: "https://discordstatus.com/api/v2/summary.json",
  },
  {
    id: "github",
    name: "GitHub",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/c2/GitHub_Invertocat_Logo.svg",
    apiUrl: "https://www.githubstatus.com/api/v2/summary.json",
  },
  {
    id: "stripe",
    name: "Stripe",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg",
    apiUrl: "https://status.stripe.com/api/v2/summary.json",
  },
  {
    id: "openai",
    name: "OpenAI",
    logo: "https://static-00.iconduck.com/assets.00/openai-icon-2021x2048-4rpe5x7n.png",
    apiUrl: "https://status.openai.com/api/v2/summary.json",
  },
  {
    id: "slack",
    name: "Slack",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Slack_icon_2019.svg/1200px-Slack_icon_2019.svg.png",
    apiUrl: "https://status.slack.com/api/v2/summary.json",
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
