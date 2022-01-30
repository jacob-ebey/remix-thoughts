import { json, LoaderFunction, redirect } from "remix";

import { getSession } from "~/session.server";

export let loader: LoaderFunction = async ({ request }) => {
  let session = await getSession(request.headers.get("Cookie"));

  if (session.get("loggedIn")) {
    return redirect("/");
  }

  throw json(null, { status: 401 });
};

export default function Login() {
  return null;
}
