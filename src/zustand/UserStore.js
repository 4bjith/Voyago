import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const UserStore = create(
  persist(
    (set) => ({
      // State: The user data object (initialized to null)
      user: null,

      // State: The JWT token (initialized to null)
      token: null,

      // ✅ NEW ACTION: Sets the entire user object
      setUser: (userData) =>
        set(() => ({
          user: userData,
        })),

      addToken: (item) =>
        set(() => ({
          token: item,
        })),

      // Action: Clears the user and token data upon logout
      logout: () =>
        set(() => ({
          user: null,
          token: null,
        })),
    }),
    {
      name: "auth-storage", // Key used in localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default UserStore;
