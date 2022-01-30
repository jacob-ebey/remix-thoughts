import { useEffect } from "react";
import type { ReactNode } from "react";
import {
  json,
  redirect,
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLocation,
  useMatches,
  useTransition,
} from "remix";
import type { ActionFunction, MetaFunction, ThrownResponse } from "remix";
import NProgress from "nprogress";
import nProgressStyles from "nprogress/nprogress.css";

import mainStylesHref from "awsm.css/dist/awsm.min.css";
import themeStylesHref from "awsm.css/dist/awsm_theme_mischka.min.css";

import { commitSession, getSession } from "~/session.server";
import { formatZodError, parseZodFormData } from "~/utils/zod";
import { LoginForm, LoginFormData } from "~/components/login-form";
import type { LoginActionData } from "~/components/login-form";

export const meta: MetaFunction = () => {
  return {
    title: "Thoughts",
    description: "An example PWA built with Remix.",
  };
};

export let action: ActionFunction = async ({ request }) => {
  let [parsed, session] = await Promise.all([
    parseZodFormData(request, LoginFormData),
    getSession(request.headers.get("Cookie")),
  ]);

  if (!parsed.success) {
    throw json<LoginActionData>(
      {
        errors: formatZodError(parsed.error),
      },
      { status: 401 }
    );
  }

  if (!process.env.LOGIN_PASSWORD) {
    throw json<LoginActionData>(
      {
        error: "Application has not been configured to allow login.",
      },
      { status: 500 }
    );
  }

  if (process.env.LOGIN_PASSWORD !== parsed.data.password) {
    throw json<LoginActionData>({ error: "Failed to login" }, { status: 401 });
  }

  session.set("loggedIn", true);

  let url = new URL(request.url);
  let redirectTo = url.searchParams.get("redirect");
  redirectTo = !redirectTo?.startsWith("/") ? "/" : redirectTo;

  return redirect(redirectTo, {
    headers: { "Set-Cookie": await commitSession(session) },
  });
};

export default function RootRoute() {
  return (
    <Document>
      <Outlet />
    </Document>
  );
}

type ThrownResponses =
  | ThrownResponse<401, null>
  | ThrownResponse<401, LoginActionData>
  | ThrownResponse<404, any>
  | ThrownResponse<500, any>;

export function CatchBoundary() {
  let { data, status } = useCatch<ThrownResponses>();

  let body = data?.message ? <h1>data?.message</h1> : null;
  if (!body) {
    switch (status) {
      case 401:
        body = <LoginForm />;
        break;
      case 404:
        body = <h1>Page not found</h1>;
        break;
      case 500:
        body = <h1>Internal server error</h1>;
        break;
      default:
        body = <h1>Something went wrong</h1>;
    }
  }

  return (
    <Document>
      <article>{body}</article>
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error("ERROR BOUNDARY", error);

  return (
    <Document>
      <h1>Something went wrong</h1>
    </Document>
  );
}

let isMount = true;
function Document({ children }: { children: ReactNode }) {
  let location = useLocation();
  let matches = useMatches();
  let transition = useTransition();

  useEffect(() => {
    if (transition.state === "idle") NProgress.done();
    else NProgress.start();
  }, [transition]);

  useEffect(() => {
    let mounted = isMount;
    isMount = false;
    if ("serviceWorker" in navigator) {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller?.postMessage({
          type: "REMIX_NAVIGATION",
          isMount: mounted,
          location,
          matches,
          manifest: window.__remixManifest,
        });
      } else {
        let listener = async () => {
          await navigator.serviceWorker.ready;
          navigator.serviceWorker.controller?.postMessage({
            type: "REMIX_NAVIGATION",
            isMount: mounted,
            location,
            matches,
            manifest: window.__remixManifest,
          });
        };
        navigator.serviceWorker.addEventListener("controllerchange", listener);
        return () => {
          navigator.serviceWorker.removeEventListener(
            "controllerchange",
            listener
          );
        };
      }
    }
  }, [location]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="theme-color" content="#c34138" />
        <Meta />
        <link rel="stylesheet" href={mainStylesHref} />
        <link rel="stylesheet" href={themeStylesHref} />
        {!isMount && <link rel="stylesheet" href={nProgressStyles} />}

        <link rel="manifest" href="/resources/manifest.json" />
        <link
          rel="apple-touch-icon"
          sizes="57x57"
          href="/icons/apple-icon-57x57.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="60x60"
          href="/icons/apple-icon-60x60.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="72x72"
          href="/icons/apple-icon-72x72.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="76x76"
          href="/icons/apple-icon-76x76.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="114x114"
          href="/icons/apple-icon-114x114.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="120x120"
          href="/icons/apple-icon-120x120.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="144x144"
          href="/icons/apple-icon-144x144.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/icons/apple-icon-152x152.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icons/apple-icon-180x180.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/icons/android-icon-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/icons/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="96x96"
          href="/icons/favicon-96x96.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/icons/favicon-16x16.png"
        />
        <Links />
      </head>
      <body>
        <header>
          <h1>Thoughts</h1>
          <nav>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <a
                  href="https://github.com/jacob-ebey/remix-thoughts"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Source
                </a>
              </li>
            </ul>
          </nav>
        </header>
        <main>{children}</main>
        <footer>
          <p>Remix Rocks</p>
        </footer>
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  );
}
