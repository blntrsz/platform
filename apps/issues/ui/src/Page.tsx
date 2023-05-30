import { useGetIssues } from "./api/openapi";

import { Link } from "react-router-dom";

export default function Page() {
  const { data, error } = useGetIssues();

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
              <Link to={`/users/${item.userId}/${item.userName}`}>
                {item.userName}
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
