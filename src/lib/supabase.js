import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Google login
export const loginWithGoogle = async () => {
  const redirectUrl =
    import.meta.env.VITE_REDIRECT_URL || "http://localhost:5173";
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: redirectUrl },
  });
};

// Logout
export const logout = async () => {
  await supabase.auth.signOut();
};

// Hent innlogget bruker
export const getCurrentUser = async () => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.log("getUser error:", error);
    return null;
  }
};

// SEEN
export const getSeen = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("seen")
      .select("tmdb_id")
      .eq("user_id", userId);
    if (error) throw error;
    return data.map((row) => row.tmdb_id);
  } catch (error) {
    console.error("Error fetching seen:", error);
    return [];
  }
};

export const addSeen = async (userId, tmdbId) => {
  try {
    const { error } = await supabase
      .from("seen")
      .insert({ user_id: userId, tmdb_id: String(tmdbId) });
    if (error) throw error;
  } catch (error) {
    console.error("Error adding seen:", error);
  }
};

export const removeSeen = async (userId, tmdbId) => {
  try {
    const { error } = await supabase
      .from("seen")
      .delete()
      .eq("user_id", userId)
      .eq("tmdb_id", String(tmdbId));
    if (error) throw error;
  } catch (error) {
    console.error("Error removing seen:", error);
  }
};

// WATCHLIST
export const getWatchlist = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("watchlist")
      .select("tmdb_id")
      .eq("user_id", userId);
    if (error) throw error;
    return data.map((row) => row.tmdb_id);
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    return [];
  }
};

export const addWatchlist = async (userId, tmdbId) => {
  try {
    const { error } = await supabase
      .from("watchlist")
      .insert({ user_id: userId, tmdb_id: String(tmdbId) });
    if (error) throw error;
  } catch (error) {
    console.error("Error adding watchlist:", error);
  }
};

export const removeWatchlist = async (userId, tmdbId) => {
  try {
    const { error } = await supabase
      .from("watchlist")
      .delete()
      .eq("user_id", userId)
      .eq("tmdb_id", String(tmdbId));
    if (error) throw error;
  } catch (error) {
    console.error("Error removing watchlist:", error);
  }
};
