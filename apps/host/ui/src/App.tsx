import React, { Suspense } from "react";

import {
  Link,
  NavLink,
  Outlet,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";

// @ts-expect-error -- module federation
const UsersPage = React.lazy(() => import("users/Page"));

// @ts-expect-error -- module federation
const IssuesPage = React.lazy(() => import("issues/Page"));
// @ts-expect-error -- module federation
const ListIssuesForUser = React.lazy(() => import("issues/ListIssuesForUser"));

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <div className="bg-slate-800 text-cyan-50 w-full h-screen p-4">
        <header className="py-4 flex justify-between items-center text-2xl">
          <Link to={"/"}>Platform</Link>
          <nav>
            <ul className="flex gap-4">
              <li>
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "text-cyan-500" : ""
                  }
                  to={"/users"}
                >
                  Users
                </NavLink>
              </li>
              <li>
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "text-cyan-500" : ""
                  }
                  to={"/issues"}
                >
                  Issues
                </NavLink>
              </li>
            </ul>
          </nav>
        </header>
        <main>
          <Suspense fallback={<>Loading...</>}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    ),
    children: [
      {
        path: "/",
        element: (
          <div>
            <h1 className="text-xl flex pb-8">Available Pages:</h1>
            <ul className="flex gap-8">
              <li>
                <Link
                  className="block rounded-md p-16 border-cyan-500 border-4 hover:bg-cyan-500"
                  to={"/users"}
                >
                  Users
                </Link>
              </li>
              <li>
                <Link
                  className="block rounded-md p-16 border-cyan-500 border-4 hover:bg-cyan-500"
                  to={"/issues"}
                >
                  Issues
                </Link>
              </li>
            </ul>
          </div>
        ),
      },
      {
        path: "/users",
        element: <UsersPage />,
      },
      {
        path: "/users/:userId",
        element: <ListIssuesForUser />,
      },
      {
        path: "/issues",
        element: <IssuesPage />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
