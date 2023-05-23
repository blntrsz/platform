import { paths } from "@platform/app-contract";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import createClient from "openapi-fetch";

const useConfig = () =>
  useQuery({
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
  const { data: config } = useConfig();
  return useQuery({
    queryKey: ["get-hello"],
    queryFn: async () => {
      if (!config) {
        return;
      }

      const { data, error } = await config.get("/hello", {});

      if (error) {
        throw error;
      }

      if (data) {
        return data;
      }
    },
    enabled: !!config,
  });
}

export function usePostHello() {
  const { data: config } = useConfig();
  return useMutation({
    mutationKey: ["post-hello"],
    mutationFn: async (name: string) => {
      if (!config) {
        return;
      }

      const { data, error } = await config.post("/hello", {
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
  const { data: config } = useConfig();
  return useQuery({
    queryKey: ["get-users"],
    queryFn: async () => {
      if (!config) {
        return;
      }

      const { data, error } = await config.get("/users", {});

      if (error) {
        throw error;
      }

      if (data) {
        return data;
      }
    },
    enabled: !!config,
  });
}

export function usePostUsers() {
  const { data: config } = useConfig();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["post-hello"],
    onSuccess: () => {
      queryClient.invalidateQueries(["get-users"]);
    },
    mutationFn: async (name: string) => {
      if (!config) {
        return;
      }

      const { data, error } = await config.post("/users", {
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
