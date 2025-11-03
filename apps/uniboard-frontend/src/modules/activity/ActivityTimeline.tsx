import { Card, CardContent, List, ListItem, ListItemText, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useActivityStore } from "./activity-store";

export const ActivityTimeline = () => {
  const events = useActivityStore((state) => state.events);

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Aktywność
        </Typography>
        {events.length === 0 ? (
          <Typography color="text.secondary">Brak zdarzeń.</Typography>
        ) : (
          <List>
            {events.map((event) => (
              <ListItem key={event.eventId} alignItems="flex-start">
                <ListItemText
                  primary={event.title}
                  secondary={
                    event.description
                      ? `${event.description} • ${dayjs(event.occurredAt).format("YYYY-MM-DD HH:mm")}`
                      : dayjs(event.occurredAt).format("YYYY-MM-DD HH:mm")
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};
