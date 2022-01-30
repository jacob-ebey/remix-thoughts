import { json, useLoaderData } from "remix";
import type { LoaderFunction } from "remix";
import { useMemo } from "react";
import type { Thought } from "@prisma/client";

import { getSession } from "~/session.server";
import prisma from "~/libs/prisma.server";
import { ThoughtDisplay } from "~/components/thought";

type LoaderData = {
  thought: Thought;
};

export let loader: LoaderFunction = async ({ params, request }) => {
  let [thought, session] = await Promise.all([
    prisma.thought.findUnique({
      where: { id: params.id },
      rejectOnNotFound: false,
    }),
    getSession(request.headers.get("Cookie")),
  ]);

  if (!thought || (!thought.published && !session.get("loggedIn"))) {
    throw json(null, { status: 404 });
  }

  return json<LoaderData>({ thought });
};

export default function PermalinkRoute() {
  let { thought } = useLoaderData<LoaderData>();

  return (
    <article>
      <ThoughtDisplay key={thought.id} thought={thought} />
    </article>
  );
}
