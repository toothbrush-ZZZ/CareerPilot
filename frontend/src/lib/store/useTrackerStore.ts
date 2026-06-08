import { create } from 'zustand';
import { ApplicationCard, Goal, KanbanColumn, KanbanColumnId } from '../types';
import {
  getApplications,
  createApplication,
  updateApplicationStatus,
  deleteApplication,
  getGoals,
  createGoal,
  toggleGoalCompletion,
  deleteGoal
} from '../utils/api';
import { useAppStore } from './useAppStore';
import { useDashboardStore } from './useDashboardStore';

const INITIAL_COLUMNS: KanbanColumn[] = [
  { id: 'applied', label: 'Applied', cards: [] },
  { id: 'interviewing', label: 'Interviewing', cards: [] },
  { id: 'offer', label: 'Offers', cards: [] },
  { id: 'rejected', label: 'Rejected', cards: [] },
];

interface TrackerState {
  columns: KanbanColumn[];
  goals: Goal[];
  isLoading: boolean;
  loadData: (force?: boolean) => Promise<void>;
  moveCard: (cardId: string, toColumn: KanbanColumnId) => void;
  addCard: (card: Omit<ApplicationCard, 'id'>) => Promise<void>;
  removeCard: (id: string) => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
  toggleGoal: (id: string) => Promise<void>;
  removeGoal: (id: string) => Promise<void>;
  reset: () => void;
}

export const useTrackerStore = create<TrackerState>((set, get) => ({
  columns: INITIAL_COLUMNS,
  goals: [],
  isLoading: false,
  reset: () => set({ columns: INITIAL_COLUMNS, goals: [], isLoading: false }),

  loadData: async (force = false) => {
    const state = get();
    const hasData = state.columns.some(col => col.cards.length > 0) || state.goals.length > 0;
    
    // Only show the full-screen loader if we have NO data
    if (!hasData) {
      set({ isLoading: true });
    }
    try {
      const [apps, goals] = await Promise.all([getApplications(), getGoals()]);
      
      const newCols = INITIAL_COLUMNS.map(col => ({
        ...col,
        cards: apps.filter(a => a.columnId === col.id)
      }));

      set({ columns: newCols, goals, isLoading: false });
    } catch (e) {
      console.warn('Failed to load tracker data (backend might be offline).');
      useAppStore.getState().addToast({ message: 'Failed to load tracker data', type: 'error' });
      set({ isLoading: false });
    }
  },

  moveCard: async (cardId, toColumnId) => {
    set((state) => {
      let movedCard: ApplicationCard | null = null;
      
      const newColumns = state.columns.map(col => {
        const cardIndex = col.cards.findIndex(c => c.id === cardId);
        if (cardIndex !== -1) {
          movedCard = { ...col.cards[cardIndex], columnId: toColumnId };
          const newCards = [...col.cards];
          newCards.splice(cardIndex, 1);
          return { ...col, cards: newCards };
        }
        return col;
      });
      
      if (!movedCard) return state;
      
      const finalColumns = newColumns.map(col => {
        if (col.id === toColumnId) {
          return { ...col, cards: [...col.cards, movedCard!] };
        }
        return col;
      });
      
      return { columns: finalColumns };
    });

    try {
      await updateApplicationStatus(cardId, toColumnId);
      useDashboardStore.getState().loadData(true);
    } catch (e) {
      console.warn('Failed to update application status (backend might be offline).');
      useAppStore.getState().addToast({ message: 'Failed to save application status', type: 'error' });
    }
  },
  
  addCard: async (cardData) => {
    try {
      const id = await createApplication(cardData);
      const newCard: ApplicationCard = { ...cardData, id };
      set((state) => {
        const newColumns = state.columns.map(col => {
          if (col.id === newCard.columnId) {
            return { ...col, cards: [...col.cards, newCard] };
          }
          return col;
        });
        return { columns: newColumns };
      });
      useDashboardStore.getState().loadData(true);
    } catch {
      useAppStore.getState().addToast({ message: 'Failed to create application', type: 'error' });
    }
  },
  
  addGoal: async (goalData) => {
    try {
      const id = await createGoal(goalData);
      const newGoal = { ...goalData, id, current: 0, completed: false, target: 1 } as Goal;
      set((state) => ({ goals: [...state.goals, newGoal] }));
      useDashboardStore.getState().loadData(true);
    } catch (e) {
      console.warn('Failed to create goal (backend might be offline).');
      useAppStore.getState().addToast({ message: 'Failed to create goal/todo', type: 'error' });
    }
  },
  
  toggleGoal: async (id) => {
    set((state) => ({
      goals: state.goals.map(g => g.id === id ? { ...g, completed: !g.completed, current: g.completed ? 0 : 1 } : g)
    }));

    try {
      await toggleGoalCompletion(id);
      useDashboardStore.getState().loadData(true);
    } catch {
      set((state) => ({
        goals: state.goals.map(g => g.id === id ? { ...g, completed: !g.completed, current: g.completed ? 0 : 1 } : g)
      }));
      useAppStore.getState().addToast({ message: 'Failed to update goal', type: 'error' });
    }
  },
  
  removeCard: async (id) => {
    const prevColumns = useTrackerStore.getState().columns;
    set((state) => ({
      columns: state.columns.map(col => ({ ...col, cards: col.cards.filter(c => c.id !== id) }))
    }));
    try {
      await deleteApplication(id);
      useDashboardStore.getState().loadData(true);
    } catch {
      set({ columns: prevColumns });
      useAppStore.getState().addToast({ message: 'Failed to delete application', type: 'error' });
    }
  },

  removeGoal: async (id) => {
    const prevGoals = useTrackerStore.getState().goals;
    set((state) => ({ goals: state.goals.filter(g => g.id !== id) }));
    try {
      await deleteGoal(id);
      useDashboardStore.getState().loadData(true);
    } catch {
      set({ goals: prevGoals });
      useAppStore.getState().addToast({ message: 'Failed to delete goal', type: 'error' });
    }
  }
}));
