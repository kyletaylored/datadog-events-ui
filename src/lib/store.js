import { create } from 'zustand';

export const useRequestStore = create((set) => ({
    requests: [],
    errors: [],

    addRequest: (request) => set((state) => ({
        requests: [request, ...state.requests].slice(0, 50) // Keep last 50 requests
    })),

    updateRequest: (id, updates) => set((state) => ({
        requests: state.requests.map((req) =>
            req.id === id ? { ...req, ...updates } : req
        )
    })),

    clearRequests: () => set({ requests: [] }),

    addError: (error) => set((state) => ({
        errors: [error, ...state.errors].slice(0, 50)
    })),

    clearErrors: () => set({ errors: [] }),
}));
