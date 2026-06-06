import { create } from 'zustand';
import { ApplicationCard, Goal, KanbanColumn, KanbanColumnId } from '../types';
import {
  getApplications,
  createApplication,
  updateApplicationStatus,
  getGoals,
  createGoal,
  toggleGoalCompletion
} from '../utils/api';
import { useAppStore } from './useAppStore';

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
  loadData: () => Promise<void>;
  moveCard: (cardId: string, toColumn: KanbanColumnId) => void;
  addCard: (card: Omit<ApplicationCard, 'id'>) => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
  toggleGoal: (id: string) => Promise<void>;
}

export const useTrackerStore = create<TrackerState>((set, get) => ({
  columns: INITIAL_COLUMNS,
  goals: [],
  isLoading: false,

  loadData: async () => {
    set({ isLoading: true });
    try {
      const [apps, goals] = await Promise.all([getApplications(), getGoals()]);
      
      const newCols = INITIAL_COLUMNS.map(col => ({
        ...col,
        cards: apps.filter(a => a.columnId === col.id)
      }));

      set({ columns: newCols, goals, isLoading: false });
    } catch (e) {
      console.error('Failed to load tracker data', e);
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

    // Update backend asynchronously
    try {
      await updateApplicationStatus(cardId, toColumnId);
    } catch (e) {
      console.error('Failed to update application status', e);
      useAppStore.getState().addToast({ message: 'Failed to save application status', type: 'error' });
      // Revert could be implemented here
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
    } catch (e) {
      useAppStore.getState().addToast({ message: 'Failed to create application', type: 'error' });
    }
  },
  
  addGoal: async (goalData) => {
    try {
      const id = await createGoal(goalData);
      const newGoal = { ...goalData, id, current: 0, completed: false, target: 1 } as Goal;
      set((state) => ({ goals: [...state.goals, newGoal] }));
    } catch (e) {
      console.error('Failed to create goal', e);
      useAppStore.getState().addToast({ message: 'Failed to create goal/todo', type: 'error' });
    }
  },
  
  toggleGoal: async (id) => {
    // Optimistic UI update
    set((state) => ({
      goals: state.goals.map(g => g.id === id ? { ...g, completed: !g.completed, current: g.completed ? 0 : 1 } : g)
    }));

    try {
      await toggleGoalCompletion(id);
    } catch (e) {
      // Revert if failed
      set((state) => ({
        goals: state.goals.map(g => g.id === id ? { ...g, completed: !g.completed, current: g.completed ? 0 : 1 } : g)
      }));
      useAppStore.getState().addToast({ message: 'Failed to update goal', type: 'error' });
    }
  }
}));
