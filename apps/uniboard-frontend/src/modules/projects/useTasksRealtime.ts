import { useEffect, useRef } from "react";
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";
import { useAuthContext } from "../auth/AuthContext";
import { API_BASE_URL } from "../shared/api-client";
import type { Comment } from "./task-comments-types";
import type { Task } from "./projects-types";

type TaskRealtimeHandlers = {
  onTaskCreated?: (task: Task) => void;
  onTaskUpdated?: (task: Task) => void;
  onTaskDeleted?: (taskId: string) => void;
  onCommentAdded?: (comment: Comment) => void;
};

const HUB_PATH = "/hubs/tasks";

export const useTasksRealtime = (
  projectId: string | null,
  handlers: TaskRealtimeHandlers,
) => {
  const {
    auth: { accessToken },
  } = useAuthContext();
  const connectionRef = useRef<HubConnection | null>(null);
  const handlersRef = useRef<TaskRealtimeHandlers>(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    const token = accessToken ?? undefined;
    if (!projectId || !token) {
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
      .configureLogging(LogLevel.Information)
      .build();

    connection.on("TaskCreated", (task: Task) => {
      handlersRef.current.onTaskCreated?.(task);
    });
    connection.on("TaskUpdated", (task: Task) => {
      handlersRef.current.onTaskUpdated?.(task);
    });
    connection.on("TaskDeleted", (taskId: string) => {
      handlersRef.current.onTaskDeleted?.(taskId);
    });
    connection.on("CommentAdded", (comment: Comment) => {
      handlersRef.current.onCommentAdded?.(comment);
    });

    const start = async () => {
      try {
        await connection.start();
        await connection.invoke("JoinProject", projectId);
      } catch (error) {
        console.error("Failed to start tasks hub connection", error);
      }
    };

    void start();
    connectionRef.current = connection;

    return () => {
      const dispose = async () => {
        try {
          if (connection.state === HubConnectionState.Connected) {
            await connection.invoke("LeaveProject", projectId);
          }
        } catch (error) {
          console.warn("Failed to leave tasks hub group", error);
        } finally {
          connection.off("TaskCreated");
          connection.off("TaskUpdated");
          connection.off("TaskDeleted");
          connection.off("CommentAdded");
          await connection.stop();
        }
      };
      void dispose();
      connectionRef.current = null;
    };
  }, [projectId, accessToken]);
};
