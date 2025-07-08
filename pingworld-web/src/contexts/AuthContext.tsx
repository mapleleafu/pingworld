import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import { User } from "@/types/auth";
import { authService } from "@/services/api/authService";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuthContext must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getAccessToken = useCallback(() => {
    return localStorage.getItem("accessToken");
  }, []);

  const getUser = useCallback(() => {
    return localStorage.getItem("user");
  }, []);

  const scheduleTokenRefresh = useCallback((token: string) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      const refreshTime = expirationTime - currentTime - 60000; // 1 minute buffer

      if (refreshTime > 0) {
        refreshTimeoutRef.current = setTimeout(() => {
          refreshAccessToken();
        }, refreshTime);
      }
    } catch (error) {
      console.error("Error parsing token:", error);
    }
  }, []);

  const refreshAccessToken = useCallback(async () => {
    try {
      const response = await authService.refresh();
      const newToken = response.data.accessToken;
      localStorage.setItem("accessToken", newToken);
      scheduleTokenRefresh(newToken);
    } catch (error) {
      clearAuth();
    }
  }, [scheduleTokenRefresh]);

  const clearAuth = useCallback(() => {
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    setIsLoading(false);
  }, []);

  // Listen for logout events from API client
  useEffect(() => {
    const handleLogout = () => clearAuth();
    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, [clearAuth]);

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await authService.refresh();
        const accessToken = response.data.accessToken;
        localStorage.setItem("accessToken", accessToken);
        scheduleTokenRefresh(accessToken);

        const userData = getUser();
        if (userData) {
          setUser(JSON.parse(userData));
        } else {
          const profileResponse = await authService.profile();
          const user = profileResponse?.data?.user;
          localStorage.setItem("user", JSON.stringify(user));
          setUser(user);
        }
      } catch (error) {
        clearAuth();
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, [getAccessToken, scheduleTokenRefresh, clearAuth]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        setUser,
        clearAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
