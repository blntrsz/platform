import React, { Suspense } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";
import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";
import "./index.css";
import ListIssuesForUser from "./ListIssuesForUser";
import Page from "./Page";

export const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <div className="bg-slate-800 text-cyan-50 w-full h-screen p-4">
        <Suspense fallback={<>Loading...</>}>
          <Outlet />
        </Suspense>
      </div>
    ),
    children: [
      {
        path: "/page",
        element: <Page />,
      },
      {
        path: "/list-issues-for-user",
        element: <ListIssuesForUser />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);
