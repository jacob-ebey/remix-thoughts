import {
  json,
  redirect,
  Form,
  useActionData,
  useLoaderData,
  useParams,
  useTransition,
} from "remix";
import type { ActionFunction, LoaderFunction } from "remix";
import { z } from "zod";
import type { Thought } from "@prisma/client";

import { getSession } from "~/session.server";
import prisma from "~/libs/prisma.server";
import { formatZodError, parseZodFormData } from "~/utils/zod";
import type { FormattedErrors } from "~/utils/zod";

export let EditFormData = z.object({
  title: z.string().min(1),
  text: z.string().min(1),
  published: z.string(),
});

type EditActionData = {
  error?: string;
  errors?: FormattedErrors<z.infer<typeof EditFormData>>;
};

export let action: ActionFunction = async ({ params, request }) => {
  let session = await getSession(request.headers.get("Cookie"));

  if (!session.get("loggedIn")) {
    throw json(null, { status: 401 });
  }

  let parsed = await parseZodFormData(request, EditFormData);

  if (!parsed.success) {
    return json<EditActionData>(
      {
        errors: formatZodError(parsed.error),
      },
      { status: 400 }
    );
  }

  let { published, ...data } = parsed.data;
  console.log(published);
  if (typeof published === "string") {
    (data as any).published = published === "true";
  }

  try {
    let thought = await prisma.thought.update({
      where: { id: params.id },
      data,
    });

    return redirect(`/edit/${thought.id}`);
  } catch (error: unknown) {
    console.error("edit action", error);

    return json<EditActionData>(
      {
        error: "Something went wrong",
      },
      { status: 500 }
    );
  }
};

export let worker: ActionFunction = ({ request }) => {};

type LoaderData = {
  thought: Thought;
};

export let loader: LoaderFunction = async ({ params, request }) => {
  let session = await getSession(request.headers.get("Cookie"));

  if (!session.get("loggedIn")) {
    throw json(null, { status: 401 });
  }

  let thought = await prisma.thought.findUnique({
    where: { id: params.id },
    rejectOnNotFound: false,
  });
  if (!thought) {
    throw json(null, { status: 404 });
  }

  return json<LoaderData>({ thought });
};

export default function EditRoute() {
  let { thought } = useLoaderData<LoaderData>();
  console.log(thought);
  let { error, errors } = useActionData<EditActionData>() || {};
  let params = useParams();
  let transition = useTransition();

  let submitting = !!transition.submission;

  return (
    <article>
      <Form method="post" key={thought.id}>
        <h1>Edit Thought</h1>
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
          defaultValue={thought.title}
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
        <textarea
          id="text"
          name="text"
          rows={5}
          defaultValue={thought.text}
          disabled={submitting}
        />
        <button type="submit" disabled={submitting}>
          Save
        </button>{" "}
        <button
          type="submit"
          name="published"
          value={!thought.published ? "true" : "false"}
          disabled={submitting}
        >
          {thought.published ? "Unpublish" : "Publish"}
        </button>
        {!!error && <output>{error}</output>}
      </Form>
      <hr />
      <Form action={`/delete/${params.id}`} method="post">
        <h2>Danger Zone</h2>
        <p>
          <button disabled={submitting}>Delete</button>
        </p>
      </Form>
    </article>
  );
}
