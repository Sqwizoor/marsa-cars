
"use client";

import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { setCookie, getCookie } from "cookies-next";

const SESSION_COOKIE_NAME = "session_id";

export default function SessionProvider() {
  useEffect(() => {
    const session = getCookie(SESSION_COOKIE_NAME);
    if (!session) {
      const newSessionId = uuidv4();
      setCookie(SESSION_COOKIE_NAME, newSessionId, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });
    }
  }, []);

  return null;
}
