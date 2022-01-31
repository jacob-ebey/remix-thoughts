import { json, redirect, Form, useActionData, useTransition } from "remix";
import type { ActionFunction, LoaderFunction } from "remix";
import { z } from "zod";

import { getSession } from "~/session.server";
import prisma from "~/libs/prisma.server";
import { formatZodError, parseZodFormData } from "~/utils/zod";
import type { FormattedErrors } from "~/utils/zod";

let CreateFormData = z.object({
  title: z.string().min(1),
  text: z.string().min(1),
});

type CreateActionData = {
  error?: string;
  errors?: FormattedErrors<z.infer<typeof CreateFormData>>;
};

export let action: ActionFunction = async ({ request }) => {
  let session = await getSession(request.headers.get("Cookie"));

  if (!session.get("loggedIn")) {
    throw json(null, { status: 401 });
  }

  let parsed = await parseZodFormData(request, CreateFormData);

  if (!parsed.success) {
    return json<CreateActionData>(
      {
        errors: formatZodError(parsed.error),
      },
      { status: 400 }
    );
  }

  try {
    let thought = await prisma.thought.create({
      data: parsed.data,
    });

    return redirect(`/permalink/${thought.id}`);
  } catch (error: unknown) {
    console.error("new action", error);

    return json<CreateActionData>(
      {
        error: "Something went wrong",
      },
      { status: 500 }
    );
  }
};

export let worker: ActionFunction = ({ request }) => {};

export let loader: LoaderFunction = async ({ request }) => {
  let session = await getSession(request.headers.get("Cookie"));

  if (!session.get("loggedIn")) {
    throw json(null, { status: 401 });
  }

  return null;
};

export default function NewRoute() {
  let { error, errors } = useActionData<CreateActionData>() || {};
  let transition = useTransition();

  let submitting = !!transition.submission;

  return (
    <article>
      <Form method="post">
        <h1>New Thought</h1>

        <label htmlFor="title">
          Title{" "}
          {errors?.title && (
            <>
              <br />
              <em>{errors.title}</em>
            </>
          )}
        </label>
        <input
          id="title"
          name="title"
          type="text"
          autoComplete="off"
          disabled={submitting}
        />

        <label htmlFor="text">
          Body{" "}
          {errors?.text && (
            <>
              <br />
              <em>{errors.text}</em>
            </>
          )}
        </label>
        <textarea id="text" name="text" rows={5} disabled={submitting} />

        <button disabled={submitting}>Create</button>

        {!!error && <output>{error}</output>}
      </Form>
    </article>
  );
}
