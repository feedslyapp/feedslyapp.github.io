// This is a Vercel Serverless Function

// Helper function to generate a plausible report history based on status
const generateReportsFromStatus = (status) => {
  switch (status) {
    case "critical":
    case "major":
      return Array.from(
        { length: 10 },
        () => 300 + Math.floor(Math.random() * 700)
      );
    case "minor":
      return Array.from(
        { length: 10 },
        () => 50 + Math.floor(Math.random() * 100)
      );
    case "none":
    default:
      return Array.from({ length: 10 }, () => 1);
  }
};

// --- Special function to handle Steam's unique API structure ---
const fetchSteamStatus = async () => {
  try {
    // --- THIS IS THE CORRECTED URL YOU FOUND ---
    const response = await fetch(
      "https://vortigaunt.steamstat.us/not_an_api.json"
    );
    if (!response.ok) throw new Error("Steam API fetch failed");
    const data = await response.json();

    // We only want to show core services, not every single game
    const coreSteamServices = [
      "Steam Store",
      "Steam Community",
      "Steam Web API",
      "CS2", // Counter-Strike 2
      "Dota 2",
    ];

    return data.services
      .filter((service) => coreSteamServices.includes(service.title))
      .map((service) => {
        // Translate their status to our system's status
        let ourStatus = "none";
        if (service.status === "minor") ourStatus = "minor";
        if (service.status === "major") ourStatus = "major";

        return {
          id: `steam-${service.title.toLowerCase().replace(/ /g, "-")}`,
          name: service.title,
          logo: "https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg",
          reports: generateReportsFromStatus(ourStatus),
        };
      });
  } catch (error) {
    console.error("Failed to fetch Steam status:", error);
    // Return an empty array if the fetch fails so it doesn't crash the site
    return [];
  }
};

// Define all the other services we want to monitor
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
  // Create a promise for the standard services
  const standardServicesPromise = Promise.all(
    servicesToMonitor.map(async (service) => {
      if (service.apiUrl) {
        try {
          const apiResponse = await fetch(service.apiUrl);
          if (!apiResponse.ok) throw new Error("API fetch failed");
          const data = await apiResponse.json();
          const reports = generateReportsFromStatus(data.status.indicator);
          return { ...service, reports };
        } catch (error) {
          console.error(`Failed to fetch status for ${service.name}:`, error);
          return { ...service, reports: generateReportsFromStatus("unknown") };
        }
      }
      return service;
    })
  );

  // Create a promise for the Steam services
  const steamServicesPromise = fetchSteamStatus();

  // Wait for ALL promises to resolve
  const [standardResults, steamResults] = await Promise.all([
    standardServicesPromise,
    steamServicesPromise,
  ]);

  // Combine the results into a single array
  const allResults = [...standardResults, ...steamResults];

  response.status(200).json(allResults);
}
