import { redirect } from "remix";
import type { ActionFunction, LoaderFunction } from "remix";

import { commitSession, getSession } from "~/session.server";

export let action: ActionFunction = async ({ request }) => {
  let session = await getSession(request.headers.get("Cookie"));
  session.unset("loggedIn");

  return redirect("/", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

export let loader: LoaderFunction = async ({ request }) => {
  return redirect("/");
};

export default function Login() {
  return null;
}
