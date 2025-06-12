// In a real application, this data would come from various APIs.
// We are simulating it here for demonstration purposes.
// The 'reports' array represents user reports over the last few hours.
const mockServicesData = [
  {
    id: "google",
    name: "Google",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg",
    reports: [5, 8, 6, 10, 7, 12, 9, 15, 11, 8], // Low reports
  },
  {
    id: "x-com",
    name: "X.com (Twitter)",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/57/X_logo_2023_%28white%29.png",
    reports: [25, 40, 88, 150, 120, 95, 70, 65, 50, 45], // Medium reports
  },
  {
    id: "discord",
    name: "Discord",
    logo: "https://logowik.com/content/uploads/images/discord-new-20218785.jpg",
    reports: [120, 250, 400, 850, 600, 450, 300, 220, 180, 150], // High reports
  },
  {
    id: "cloudflare",
    name: "Cloudflare",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Cloudflare_logo.svg",
    reports: [2, 1, 3, 2, 4, 1, 5, 3, 2, 4],
  },
  {
    id: "aws",
    name: "Amazon Web Services",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg",
    reports: [10, 12, 9, 15, 11, 8, 14, 19, 13, 10],
  },
  {
    id: "github",
    name: "GitHub",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/c2/GitHub_Invertocat_Logo.svg",
    reports: [5, 6, 4, 8, 12, 25, 40, 22, 15, 10],
  },
  {
    id: "reddit",
    name: "Reddit",
    logo: "https://www.redditinc.com/assets/images/site/reddit-logo.png",
    reports: [300, 250, 180, 450, 900, 1200, 750, 500, 350, 300],
  },
  {
    id: "youtube",
    name: "YouTube",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg",
    reports: [15, 22, 18, 25, 40, 80, 110, 90, 60, 45],
  },
  {
    id: "slack",
    name: "Slack",
    logo: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg",
    reports: [3, 2, 5, 4, 6, 3, 7, 5, 4, 2],
  },
];
