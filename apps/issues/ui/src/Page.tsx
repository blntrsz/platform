import { useGetIssues } from "./api/openapi";

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
            <div>
              <div>{item.title}</div>
              <div>{item.userName}</div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
