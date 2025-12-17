import { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "customer" | "agency" | null;

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  profileImageUrl?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  userRole: UserRole;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  setUserRole: (role: UserRole) => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  address?: string;
  agencyName?: string;
  contactNumber?: string;
  role: UserRole;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem("gas-booking-user");
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem("gas-booking-role");
    return (saved as UserRole) || null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("gas-booking-user", JSON.stringify(user));
      localStorage.setItem("gas-booking-role", user.role || "");
    } else {
      localStorage.removeItem("gas-booking-user");
      localStorage.removeItem("gas-booking-role");
    }
  }, [user]);

  const login = async (email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    try {
      const mockUser: AuthUser = {
        id: `${role}-${Date.now()}`,
        email,
        name: role === "customer" ? "John Doe" : "Gas Agency Inc.",
        role,
        profileImageUrl: undefined,
      };
      setUser(mockUser);
      setUserRole(role);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const mockUser: AuthUser = {
        id: `${data.role}-${Date.now()}`,
        email: data.email,
        name: data.role === "customer" ? data.name : data.agencyName || data.name,
        role: data.role,
        profileImageUrl: undefined,
      };
      setUser(mockUser);
      setUserRole(data.role);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        userRole,
        login,
        register,
        logout,
        setUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
