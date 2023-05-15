import { paths } from "@platform/app-contract";
import { useMutation, useQuery } from "@tanstack/react-query";
import createClient from "openapi-fetch";

const { get, post } = createClient<paths>({
  baseUrl: "http://localhost:9000",
  headers: {
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
  },
});

export function useGetHello() {
  return useQuery({
    queryKey: ["get-hello"],
    queryFn: async () => {
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
