import { Alert, Snackbar } from "@mui/material";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Notification = {
  message: string;
  severity?: "success" | "info" | "warning" | "error";
};

type NotificationContextValue = {
  notify: (notification: Notification) => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(
  null,
);

type NotificationProviderProps = {
  children: ReactNode;
};

export const NotificationProvider = ({
  children,
}: NotificationProviderProps) => {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const notify = useCallback((next: Notification) => {
    setNotification(next);
    setOpen(true);
  }, []);

  const value = useMemo(
    () => ({
      notify,
    }),
    [notify],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        open={open}
        autoHideDuration={4000}
        onClose={handleClose}
      >
        <Alert
          onClose={handleClose}
          severity={notification?.severity ?? "info"}
          variant="filled"
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return ctx.notify;
};
