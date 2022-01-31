import { createCookieSessionStorage } from "remix";

if (!process.env.COOKIE_SECRET) {
  throw new Error("COOKIE_SECRET environment variable must be set");
}

let { commitSession, destroySession, getSession } = createCookieSessionStorage({
  cookie: {
    name: "session",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    secrets: [process.env.COOKIE_SECRET],
  },
});

export { commitSession, destroySession, getSession };
