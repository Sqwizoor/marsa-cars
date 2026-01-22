
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

const SESSION_COOKIE_NAME = "session_id";

export async function getOrCreateSessionId(): Promise<string> {
  const cookieStore = await cookies();
  const existingSessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (existingSessionId) {
    return existingSessionId;
  }

  // If no session exists, generate one for the current request context
  // Note: This won't persist unless we set it on the client side (which SessionProvider does)
  return uuidv4();
}
