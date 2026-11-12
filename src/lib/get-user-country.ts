import { Country } from "./types";
import countries from "@/data/countries.json";

// Define the default main country (South Africa)
const DEFAULT_COUNTRY: Country = {
  name: "South Africa",
  code: "ZA",
  city: "Johannesburg",
  region: "Gauteng",
};

export async function getUserCountry(): Promise<Country> {
  // South Africa is our main and default country
  return DEFAULT_COUNTRY;
}

