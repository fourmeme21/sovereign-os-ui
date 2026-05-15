import { create } from "zustand";

export const useJuniorStore = create((set, get) => ({
  decisions: [],
  autoApprovedCount: 0,

  addDecision: (decision) =>
    set((state) => ({
      decisions: [decision, ...state.decisions],
    })),

  approveDecision: (id) =>
    set((state) => ({
      decisions: state.decisions.map((d) =>
        d.id === id ? { ...d, status: "APPROVED" } : d
      ),
    })),

  rejectDecision: (id) =>
    set((state) => ({
      decisions: state.decisions.map((d) =>
        d.id === id ? { ...d, status: "REJECTED" } : d
      ),
    })),

  incrementAutoApproved: () =>
    set((state) => ({
      autoApprovedCount: state.autoApprovedCount + 1,
    })),

  clearDecisions: () =>
    set({ decisions: [], autoApprovedCount: 0 }),
}));
