import {
  Form,
  useCatch,
  useLocation,
  useSearchParams,
  useTransition,
} from "remix";
import type { ThrownResponse } from "remix";
import { z } from "zod";

import type { FormattedErrors } from "~/utils/zod";

export let LoginFormData = z.object({
  password: z.string().min(1),
});

export type LoginActionData = {
  error?: string;
  errors?: FormattedErrors<z.infer<typeof LoginFormData>>;
};

type ThrownResponses = ThrownResponse<401, LoginActionData>;

export function LoginForm() {
  let { data } = useCatch<ThrownResponses>();
  let location = useLocation();
  let [searchParams] = useSearchParams();
  let transition = useTransition();

  let { error, errors } = data || {};
  let submitting = !!transition.submission;

  return (
    <Form
      method="post"
      action={`/?redirect=${
        searchParams.get("redirect") ||
        (location.pathname === "/login" ? "/" : location.pathname)
      }`}
    >
      <h1>Login</h1>

      <label htmlFor="password">
        Password{" "}
        {errors?.password && (
          <>
            <br />
            <em>{errors.password}</em>
          </>
        )}
      </label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        disabled={submitting}
      />

      <button disabled={submitting}>Submit</button>

      {!!error && <output>{error}</output>}
    </Form>
  );
}
