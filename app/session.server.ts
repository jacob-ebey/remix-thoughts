import { createCookieSessionStorage } from "remix";

let { commitSession, destroySession, getSession } = createCookieSessionStorage({
  cookie: {
    name: "session",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  },
});

export { commitSession, destroySession, getSession };
