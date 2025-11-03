import { useEffect, useRef } from "react";
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "../auth/AuthContext";
import { API_BASE_URL } from "../shared/api-client";
import { useNotification } from "../shared/NotificationProvider";
import { PROJECTS_QUERY_KEY } from "../projects/projects-hooks";
import { useActivityStore, type ActivityEvent } from "./activity-store";

const HUB_PATH = "/hubs/activity";

export const useActivityStream = () => {
  const {
    auth: { accessToken },
  } = useAuthContext();
  const notify = useNotification();
  const queryClient = useQueryClient();
  const connectionRef = useRef<HubConnection | null>(null);

  useEffect(() => {
    const token = accessToken ?? undefined;
    if (!token) {
      const connection = connectionRef.current;
      if (connection) {
        void connection.stop();
        connectionRef.current = null;
      }
      return;
    }

    const connection = new HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}${HUB_PATH}`, {
        accessTokenFactory: () => token,
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    connection.on("ActivityPublished", (event: ActivityEvent) => {
      useActivityStore.getState().addEvent(event);
      if (event.type.startsWith("project_")) {
        queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
      }
      notify({ message: event.title, severity: "info" });
    });

    const start = async () => {
      try {
        await connection.start();
      } catch (error) {
        console.error("Failed to start activity hub connection", error);
      }
    };

    void start();
    connectionRef.current = connection;

    return () => {
      const dispose = async () => {
        try {
          if (connection.state === HubConnectionState.Connected) {
            await connection.stop();
          }
        } finally {
          connection.off("ActivityPublished");
        }
      };
      void dispose();
      connectionRef.current = null;
    };
  }, [accessToken, notify, queryClient]);
};
