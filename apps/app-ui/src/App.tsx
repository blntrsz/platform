import "./App.css";
import { useGetHello, usePostHello } from "./api/openapi";

function App() {
  const { data, isLoading } = useGetHello();
  const { mutate, data: postData } = usePostHello();

  if (isLoading) {
    return <div>Loading..</div>;
  }

  if (!data) {
    return <div>No Data</div>;
  }

  return (
    <>
      <h1>{postData?.greeting ?? data.greeting}</h1>
      <div className="card">
        <button onClick={() => mutate("Bob")}>Hello, my name is Bob!</button>
      </div>
    </>
  );
}

export default App;
