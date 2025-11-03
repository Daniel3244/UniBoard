import { create } from "zustand";
import { devtools } from "zustand/middleware";

type ProjectsUiState = {
  selectedProjectId: string | null;
  selectProject: (projectId: string | null) => void;
};

export const useProjectsStore = create<ProjectsUiState>()(
  devtools((set) => ({
    selectedProjectId: null,
    selectProject: (projectId) => set({ selectedProjectId: projectId }),
  })),
);
