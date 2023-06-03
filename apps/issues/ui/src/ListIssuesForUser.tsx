import { useRef } from "react";

import { useGetIssuesForUser, usePostHello } from "./api/openapi";

import { Link, useParams } from "react-router-dom";

export default function ListIssuesForUser() {
  const { userId, userName } = useParams();
  const { error, data, isFetching } = useGetIssuesForUser(
    parseInt(userId ?? "")
  );
  const { mutate } = usePostHello();
  const ref = useRef<HTMLInputElement>(null);

  if (isFetching) {
    return null;
  }

  if (error || !data) {
    return <>Error</>;
  }

  return (
    <>
      <ul>
        {data.map((item) => (
          <li key={item.id}>
            <div className="flex justify-between">
              <div>{item.title}</div>
              <div>
                <Link to={`/users/${userId}/${userName}`}>{item.userName}</Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex gap-4">
        <input style={{ color: "black" }} ref={ref} />
        <button
          onClick={() =>
            mutate({
              title: ref.current?.value ?? "",
              userId: parseInt(userId ?? ""),
              userName: userName ?? "",
            })
          }
        >
          Create
        </button>
      </div>
    </>
  );
}
