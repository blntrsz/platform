import { queryClient } from "../main";

import { paths } from "@platform/app-contract";
import { useMutation, useQuery } from "@tanstack/react-query";
import createClient from "openapi-fetch";

const fetchConfig = () =>
  queryClient.fetchQuery({
    queryKey: ["config"],
    cacheTime: 1_000 * 60 * 60 * 24,
    queryFn: async () => {
      return createClient<paths>({
        baseUrl: import.meta.env.DEV
          ? import.meta.env.VITE_API_URL
          : (await fetch("./config.json").then((result) => result.json()))
              .apiUrl,
        headers: {
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "*",
        },
      });
    },
  });

export function useGetHello() {
  return useQuery({
    queryKey: ["get-hello"],
    queryFn: async () => {
      const { get } = await fetchConfig();
      const { data, error } = await get("/hello", {});

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
    mutationKey: ["post-hello"],
    mutationFn: async (name: string) => {
      const { post } = await fetchConfig();
      const { data, error } = await post("/hello", {
        body: {
          name,
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
