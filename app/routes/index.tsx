import { json, useLoaderData } from "remix";
import type { LoaderFunction } from "remix";

import type { Thought } from "@prisma/client";

import { getSession } from "~/session.server";
import prisma from "~/libs/prisma.server";
import { ThoughtDisplay } from "~/components/thought";

type LoaderData = {
  thoughts: Thought[];
};

export let loader: LoaderFunction = async ({ request }) => {
  let session = await getSession(request.headers.get("Cookie"));

  let where = session.get("loggedIn") ? undefined : { published: true };
  let thoughts = await prisma.thought.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return json<LoaderData>({ thoughts });
};

export default function IndexRoute() {
  let { thoughts } = useLoaderData<LoaderData>();

  return (
    <article>
      <h1>Welcome!</h1>
      <p>
        This is an example PWA built with{" "}
        <a href="https://remix.run" target="_blank" rel="noreferrer noopener">
          Remix
        </a>
        , PostgreSQL and Prisma.
      </p>

      {thoughts.map((thought) => (
        <ThoughtDisplay key={thought.id} thought={thought} />
      ))}
    </article>
  );
}
