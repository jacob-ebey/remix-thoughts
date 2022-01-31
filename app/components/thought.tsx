import { useMemo } from "react";
import { Link } from "remix";
import type { Thought } from "@prisma/client";

export function ThoughtDisplay({ thought }: { thought: Thought }) {
  let body = useMemo(() => {
    let result = [];
    let split = thought.text.split("\n");

    let i = 0;
    for (let s of split) {
      s = s.trim();
      if (s) result.push(<p key={s + `${i}`}>{s}</p>);
      i++;
    }

    return result;
  }, [thought.text]);

  return (
    <section key={thought.id}>
      <h2>
        <Link to={`/permalink/${thought.id}`}>{thought.title}</Link>{" "}
        {!thought.published && (
          <small>
            (<Link to={`/edit/${thought.id}`}>edit</Link>)
          </small>
        )}
      </h2>
      {body}
    </section>
  );
}
