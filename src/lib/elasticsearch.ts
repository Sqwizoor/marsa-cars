import { Client } from "@elastic/elasticsearch";

let clientInstance: Client | null = null;

export function getElasticsearchClient(): Client | null {
  const cloudId = process.env.ELASTICSEARCH_CLOUD_ID;
  const apiKey = process.env.ELASTICSEARCH_API_KEY;

  if (!cloudId || !apiKey) {
    return null;
  }

  if (!clientInstance) {
    clientInstance = new Client({
      cloud: {
        id: cloudId,
      },
      auth: {
        apiKey: apiKey,
      },
      requestTimeout: 30000,
      maxRetries: 3,
    });
  }

  return clientInstance;
}

// Proxy wrapper so imports of `client` don't throw during build or when env vars are unset
const client = new Proxy({} as Client, {
  get(target, prop, receiver) {
    const instance = getElasticsearchClient();
    if (!instance) {
      if (prop === "indices") {
        return new Proxy({}, {
          get: () => async () => ({}),
        });
      }
      return async () => ({ hits: { hits: [] }, errors: false });
    }
    const value = Reflect.get(instance, prop, receiver);
    if (typeof value === "function") {
      return value.bind(instance);
    }
    return value;
  },
});

export default client;
