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
  try {
    // Attempt to detect country by IP
    const response = await fetch(
      `https://ipinfo.io/?token=${process.env.IPINFO_TOKEN}`
    );

    if (response.ok) {
      const data = await response.json();
      userCountry = {
        name:
          countries.find((c) => c.code === data.country)?.name || data.country,
        code: data.country,
        city: data.city,
        region: data.region,
      };
    }
  } catch (error) {
    // Log error if necessary but do not throw
    console.error("Failed to fetch IP info", error);
  }
  return userCountry;
}
