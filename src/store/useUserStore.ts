import { create } from 'zustand';
import { Member } from '@/types';
import { mockCurrentUser } from '@/data/mockMember';

interface UserState {
  currentUser: Member;
  setCurrentUser: (user: Member) => void;
}

export const useUserStore = create<UserState>((set) => ({
  currentUser: mockCurrentUser,
  setCurrentUser: (user) => set({ currentUser: user }),
}));
