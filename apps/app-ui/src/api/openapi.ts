import { paths } from "@platform/app-contract";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import createClient from "openapi-fetch";

const { get, post } = createClient<paths>({
  baseUrl: import.meta.env.VITE_API_URL.replace("/$", ""),
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

export function useGetUsers() {
  return useQuery({
    queryKey: ["get-users"],
    queryFn: async () => {
      const { data, error } = await get("/users", {});

      if (error) {
        throw error;
      }

      if (data) {
        return data;
      }
    },
  });
}

export function usePostUsers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["post-hello"],
    onSuccess: () => {
      queryClient.invalidateQueries(["get-users"]);
    },
    mutationFn: async (name: string) => {
      const { data, error } = await post("/users", {
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
