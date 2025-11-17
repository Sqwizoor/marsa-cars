import { Client } from "@elastic/elasticsearch";

if (!process.env.ELASTICSEARCH_CLOUD_ID) {
  console.warn("Warning: ELASTICSEARCH_CLOUD_ID is not set");
}

if (!process.env.ELASTICSEARCH_API_KEY) {
  console.warn("Warning: ELASTICSEARCH_API_KEY is not set");
}

const client = new Client({
  cloud: {
    id: process.env.ELASTICSEARCH_CLOUD_ID || "",
  },
  auth: {
    apiKey: process.env.ELASTICSEARCH_API_KEY || "",
  },
  // Add timeout and retry settings for better reliability
  requestTimeout: 30000,
  maxRetries: 3,
});

export default client;
