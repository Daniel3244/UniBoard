import { create } from "zustand";

export type ActivityEvent = {
  eventId: string;
  type: string;
  title: string;
  description?: string | null;
  projectId?: string | null;
  taskId?: string | null;
  commentId?: string | null;
  occurredAt: string;
};

type ActivityState = {
  events: ActivityEvent[];
  addEvent: (event: ActivityEvent) => void;
  reset: () => void;
};

const MAX_EVENTS = 20;

export const useActivityStore = create<ActivityState>((set) => ({
  events: [],
  addEvent: (event) =>
    set((state) => {
      const deduplicated = state.events.filter((existing) => existing.eventId !== event.eventId);
      const next = [event, ...deduplicated];
      return { events: next.slice(0, MAX_EVENTS) };
    }),
  reset: () => set({ events: [] }),
}));
