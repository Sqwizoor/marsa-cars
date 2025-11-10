import { Country } from "./types";
import countries from "@/data/countries.json";

// Define the default country
const DEFAULT_COUNTRY: Country = {
  name: "South Africa",
  code: "ZA",
  city: "",
  region: "",
};

export async function getUserCountry(): Promise<Country> {
  let userCountry: Country = DEFAULT_COUNTRY;
  
  // Skip IP detection if token is not configured
  if (!process.env.IPINFO_TOKEN) {
    console.warn("IPINFO_TOKEN not configured, using default country");
    return userCountry;
  }

  try {
    // Attempt to detect country by IP with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(
      `https://ipinfo.io/?token=${process.env.IPINFO_TOKEN}`,
      { signal: controller.signal }
    );
    
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.country) {
        userCountry = {
          name:
            countries.find((c) => c.code === data.country)?.name || data.country,
          code: data.country,
          city: data.city || "",
          region: data.region || "",
        };
      }
    } else {
      console.warn(`IPInfo API returned status ${response.status}, using default country`);
    }
  } catch (error) {
    // Log error but gracefully fall back to default
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn("IP geolocation request timed out, using default country");
    } else {
      console.warn("Failed to fetch IP info, using default country:", error instanceof Error ? error.message : 'Unknown error');
    }
  }
  return userCountry;
}
