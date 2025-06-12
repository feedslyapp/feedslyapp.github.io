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
    const url = "https://vortigaunt.steamstat.us/not_an_api.json";
    // --- THIS IS THE FIX ---
    // Add both User-Agent and Referer headers to fully mimic a browser
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Referer: "https://steamstat.us/",
      },
    });

    if (!response.ok) {
      throw new Error(`Steam API fetch failed: ${response.statusText}`);
    }
    const data = await response.json();

    const coreSteamServices = [
      "Steam Store",
      "Steam Community",
      "Steam Web API",
      "CS2",
      "Dota 2",
    ];

    return data.services
      .filter((service) => coreSteamServices.includes(service.title))
      .map((service) => {
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

  const steamServicesPromise = fetchSteamStatus();

  const [standardResults, steamResults] = await Promise.all([
    standardServicesPromise,
    steamServicesPromise,
  ]);

  const allResults = [...standardResults, ...steamResults];

  response.status(200).json(allResults);
}
