import { redirect } from "remix";
import type { ActionFunction } from "remix";

import { getSession } from "~/session.server";
import prisma from "~/libs/prisma.server";

export let action: ActionFunction = async ({ params, request }) => {
  let session = await getSession(request.headers.get("Cookie"));

  if (!session.get("loggedIn")) {
    return redirect(`/edit/${params.id}`);
  }

  try {
    await prisma.thought.delete({ where: { id: params.id } });
    return redirect(`/`);
  } catch (error) {
    console.error("Failed to delete thought", error);
    return redirect(`/edit/${params.id}`);
  }
};
