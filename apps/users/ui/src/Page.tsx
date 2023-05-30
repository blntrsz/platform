import { useRef } from "react";

import { useGetUsers, usePostUsers } from "./api/openapi";

import { Link } from "react-router-dom";

export default function Page() {
  const { error, data } = useGetUsers();
  const { mutate } = usePostUsers();
  const ref = useRef<HTMLInputElement>(null);

  if (error || !data) {
    return <>Error</>;
  }

  return (
    <>
      <ul>
        {data.map((item) => (
          <li key={item.id}>
            <div>
              <div>
                <Link to={`/users/${item.id}/${item.userName}`}>
                  {item.userName}
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex gap-4 text-dark">
        <input style={{ color: "black" }} ref={ref} />
        <button onClick={() => mutate(ref.current?.value ?? "")}>Create</button>
      </div>
    </>
  );
}
