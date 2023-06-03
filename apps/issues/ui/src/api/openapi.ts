import { paths } from "@platform/issues-contract";
import { useMutation, useQuery } from "@tanstack/react-query";
import createClient from "openapi-fetch";

const { get, post } = createClient<paths>({
  baseUrl: import.meta.env.VITE_ISSUES_API_URL.replace(/\/$/, ""),
  headers: {
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
  },
});

export function useGetIssues() {
  return useQuery({
    queryKey: ["get-issues"],
    suspense: true,
    queryFn: async () => {
      const { data, error } = await get("/issues", {});

      if (error) {
        throw error;
      }

      if (data) {
        return data;
      }
    },
  });
}

export function usePostHello() {
  return useMutation({
    mutationFn: async ({
      title,
      userId,
      userName,
    }: {
      title: string;
      userId: number;
      userName: string;
    }) => {
      const { data, error } = await post("/issues", {
        body: {
          title,
          userId,
          userName,
        },
      });

      if (error) {
        throw error;
      }

      if (data) {
        return data;
      }
    },
  });
}

export function useGetIssuesForUser(userId: number) {
  return useQuery({
    queryKey: ["get-issues-for-user"],
    suspense: true,
    queryFn: async () => {
      const { data, error } = await get("/issues/{userId}", {
        params: {
          path: { userId },
        },
      });

      if (error) {
        throw error;
      }

      if (data) {
        return data;
      }
    },
  });
}
