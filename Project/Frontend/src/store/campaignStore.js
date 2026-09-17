import { create } from "zustand";
import { supabase } from "../lib/supabase";

const useCampaignStore = create((set, get) => ({
  campaigns: [],
  loading: false,
  error: null,

  fetchCampaigns: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      set({ campaigns: data, loading: false, error: null });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createCampaign: async (campaignData) => {
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .insert([campaignData])
        .select()
        .single();

      if (error) throw error;
      set((state) => ({
        campaigns: [data, ...state.campaigns],
      }));
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  updateCampaign: async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      set((state) => ({
        campaigns: state.campaigns.map((campaign) =>
          campaign.id === id ? data : campaign,
        ),
      }));
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },
}));

export default useCampaignStore;
