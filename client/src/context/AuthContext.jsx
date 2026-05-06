import { createContext, useContext, useMemo, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

const getInitialUser = () => {
  const stored = localStorage.getItem("paytrace_user");
  return stored ? JSON.parse(stored) : null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getInitialUser);

  const persistAuth = (payload) => {
    localStorage.setItem("paytrace_token", payload.token);
    localStorage.setItem("paytrace_user", JSON.stringify(payload.user));
    setUser(payload.user);
  };

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    persistAuth(data);
  };

  const signup = async (name, email, password) => {
    const { data } = await api.post("/auth/signup", { name, email, password });
    persistAuth(data);
  };

  const logout = () => {
    localStorage.removeItem("paytrace_token");
    localStorage.removeItem("paytrace_user");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      signup,
      logout
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};

