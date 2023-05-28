import { useRef } from "react";

import "./App.css";
import { useGetUsers, usePostUsers } from "./api/openapi";

function App() {
  const { data, isLoading } = useGetUsers();
  const { mutate } = usePostUsers();
  const ref = useRef<HTMLInputElement>(null);

  if (isLoading) {
    return <div>Loading..</div>;
  }

  if (!data) {
    return <div>No Data</div>;
  }

  return (
    <>
      <h1>Hello, my name is {data.name}</h1>
      <div className="card">
        <input ref={ref} />
        <button onClick={() => mutate(ref.current?.value ?? "")}>
          Add name
        </button>
      </div>
    </>
  );
}

export default App;
