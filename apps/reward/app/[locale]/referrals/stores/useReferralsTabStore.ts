import { create } from "zustand";

export enum ReferralsTab {
  referrals = "referrals",
  history = "history",
}

interface ReferralsTabStore {
  activeTab: ReferralsTab;
  setActiveTab: (tab: ReferralsTab) => void;
}

export const useReferralsTabStore = create<ReferralsTabStore>((set) => ({
  activeTab: ReferralsTab.referrals,
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
