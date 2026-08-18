import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/crm';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, password: string, role_override?: UserRole) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const defaultUser: User = {
  id: "usr-1",
  name: "Kabir Mehta",
  email: "kabir.mehta@nexoracrm.in",
  role: "ADMIN",
  department: "Executive Leadership",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  status: "Active",
  last_active: "Online now"
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('nexora_user');
    return saved ? JSON.parse(saved) : defaultUser;
  });

  const role = user?.role || "ADMIN";

  const login = async (email: string, password: string, role_override?: UserRole): Promise<boolean> => {
    try {
      const res = await api.login(email, password, role_override);
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('nexora_user', JSON.stringify(res.user));
        return true;
      }
    } catch (e) {
      // Fallback local login
      const fallbackUser: User = {
        ...defaultUser,
        role: role_override || "ADMIN",
        name: role_override === "SALES_MANAGER" ? "Priya Patil" : 
              role_override === "SALES_EXECUTIVE" ? "Amit Sharma" : 
              role_override === "SUPPORT_AGENT" ? "Sneha Kulkarni" : "Kabir Mehta"
      };
      setUser(fallbackUser);
      localStorage.setItem('nexora_user', JSON.stringify(fallbackUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nexora_user');
  };

  const switchRole = async (newRole: UserRole) => {
    if (!user) return;
    try {
      await api.switchRole(user.id, newRole);
    } catch (e) {
      // Local fallback
    }
    const updated = { ...user, role: newRole };
    setUser(updated);
    localStorage.setItem('nexora_user', JSON.stringify(updated));
  };

  const hasPermission = (permission: string): boolean => {
    if (role === "ADMIN") return true;
    if (role === "SALES_MANAGER") {
      return ["manage_leads", "manage_deals", "manage_tasks", "view_reports", "view_analytics", "manage_contacts", "manage_companies", "use_ai_assistant"].includes(permission);
    }
    if (role === "SALES_EXECUTIVE") {
      return ["view_assigned_leads", "manage_assigned_deals", "manage_own_tasks", "log_activities", "use_ai_assistant", "view_contacts"].includes(permission);
    }
    if (role === "SUPPORT_AGENT") {
      return ["view_companies", "view_contacts", "log_support_activities", "use_ai_assistant", "manage_own_tasks"].includes(permission);
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, role, isAuthenticated: !!user, login, logout, switchRole, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
