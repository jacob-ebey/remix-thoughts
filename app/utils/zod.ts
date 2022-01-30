import type { ZodError, ZodObject, ZodEffects, SafeParseReturnType } from "zod";
import { z } from "zod";

export type FormattedErrors<T extends {}> = Partial<Record<keyof T, string>>;

export function formatZodError<T extends {}>(zodError: ZodError<T>) {
  let errors: FormattedErrors<T> = {};

  for (let error of zodError.issues) {
    let key = error.path[0] as keyof T;
    errors[key] = error.message;
  }

  return errors;
}

export async function parseZodFormData<
  Schema extends ZodEffects<any> | ZodObject<any>
>(
  request: Request,
  schema: Schema
): Promise<SafeParseReturnType<any, z.infer<Schema>>> {
  let formData = new URLSearchParams(await request.text());

  let data: Record<string, string | string[]> = {};
  for (let key of formData.keys()) {
    let values = formData.getAll(key);
    data[key] = values.length <= 1 ? values[0] : values;
  }

  return schema.safeParseAsync(data);
}
