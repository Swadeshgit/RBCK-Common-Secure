import { createContext, useContext, useState, useEffect } from "react";
import { loginApi, getMeApi, logoutApi } from "../api/authApi.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await getMeApi();
        /* getMe ka user object + hasPassword ko merge karke rakhte hain */
        setUser({ ...res.data.user.toObject?.() ?? res.data.user, hasPassword: res.data.hasPassword });
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await loginApi({ email, password });
    const { token, user: loggedInUser } = res.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);

    return res.data;
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (error) {}
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const refreshUser = (updatedUser, newToken) => {
    if (newToken) localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  useEffect(() => {
    const handleForceLogout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    };

    window.addEventListener("force-logout", handleForceLogout);
    return () => window.removeEventListener("force-logout", handleForceLogout);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
