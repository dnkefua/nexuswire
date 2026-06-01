"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  username: string;
}

function authErrorMessage(error: unknown, action: "login" | "register" | "google"): string {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: unknown }).code)
      : "";

  switch (code) {
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Invalid username/email or password.";
    case "auth/email-already-in-use":
      return "That account already exists. Try signing in instead.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/operation-not-allowed":
      return "This sign-in method is not enabled in Firebase Authentication.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized for Firebase sign-in yet.";
    case "auth/popup-blocked":
    case "auth/popup-closed-by-user":
      return "Google sign-in was blocked or closed. Try again, or use email and password.";
    case "auth/redirect-cancelled-by-user":
      return "Google sign-in was cancelled.";
    case "auth/network-request-failed":
      return "Network error while contacting Firebase. Check the connection and try again.";
    case "auth/web-storage-unsupported":
      return "This browser does not allow the storage Firebase Auth needs.";
    default:
      if (action === "google") {
        return "Google sign-in could not complete in this browser. Use email and password, or try again from the web app.";
      }
      return action === "register" ? "Account creation failed. Please try again." : "Sign-in failed. Please try again.";
  }
}

function toFirebaseEmail(value: string) {
  const trimmed = value.trim();
  return trimmed.includes("@") ? trimmed : `${trimmed}@nexuswire.com`;
}

interface UserContextType {
  currentUser: User | null;
  isAuthModalOpen: boolean;
  authModalTab: "login" | "register";
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  logout: () => void;
  openAuth: (tab?: "login" | "register") => void;
  closeAuth: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");

  // Load active session from localStorage on mount & listen to Firebase auth changes
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    const initAuth = async () => {
      try {
        const { getFirebaseClientApp } = await import("@/lib/firebase-client");
        const app = getFirebaseClientApp();
        if (!app) {
          // Local storage fallback for dev/demo mode
          const savedUser = localStorage.getItem("nexuswire-current-user");
          if (savedUser) {
            const parsed = JSON.parse(savedUser);
            if (parsed && typeof parsed === "object" && typeof parsed.username === "string") {
              setCurrentUser(parsed);
            } else {
              localStorage.removeItem("nexuswire-current-user");
              setCurrentUser(null);
            }
          }
          return;
        }

        const { getAuth, onAuthStateChanged } = await import("firebase/auth");
        const auth = getAuth(app);
        
        unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            const userObj = { username: user.displayName || user.email?.split("@")[0] || "User" };
            setCurrentUser(userObj);
            localStorage.setItem("nexuswire-current-user", JSON.stringify(userObj));
            localStorage.setItem("nexuswire-user-name", userObj.username);
          } else {
            setCurrentUser(null);
            localStorage.removeItem("nexuswire-current-user");
            localStorage.setItem("nexuswire-user-name", "Guest");
          }
        });
      } catch (e) {
        console.error("Auth listener initialization failed:", e);
      }
    };

    initAuth();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const mockLogin = async (username: string, password: string): Promise<boolean> => {
    const sanitized = username.trim();
    if (!sanitized) return false;
    const usersRaw = localStorage.getItem("nexuswire-users") || "[]";
    const users = JSON.parse(usersRaw) as { username: string; passwordHash: string }[];
    const user = users.find((u) => u.username.toLowerCase() === sanitized.toLowerCase());
    
    if (user && user.passwordHash === password) {
      const userObj = { username: user.username };
      setCurrentUser(userObj);
      localStorage.setItem("nexuswire-current-user", JSON.stringify(userObj));
      localStorage.setItem("nexuswire-user-name", user.username);
      setIsAuthModalOpen(false);
      return true;
    }
    return false;
  };

  const mockRegister = async (username: string, password: string): Promise<boolean> => {
    const sanitized = username.trim();
    if (!sanitized || !password) return false;
    const usersRaw = localStorage.getItem("nexuswire-users") || "[]";
    const users = JSON.parse(usersRaw) as { username: string; passwordHash: string }[];
    if (users.some((u) => u.username.toLowerCase() === sanitized.toLowerCase())) return false;
    users.push({ username: sanitized, passwordHash: password });
    localStorage.setItem("nexuswire-users", JSON.stringify(users));
    const userObj = { username: sanitized };
    setCurrentUser(userObj);
    localStorage.setItem("nexuswire-current-user", JSON.stringify(userObj));
    localStorage.setItem("nexuswire-user-name", sanitized);
    setIsAuthModalOpen(false);
    return true;
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    const { getFirebaseClientApp } = await import("@/lib/firebase-client");
    const app = getFirebaseClientApp();
    if (!app) {
      return mockLogin(username, password);
    }

    try {
      const { getAuth, signInWithEmailAndPassword } = await import("firebase/auth");
      const auth = getAuth(app);
      
      // Auto-append domain for raw handles so it functions as a valid Firebase email.
      const email = toFirebaseEmail(username);
      await signInWithEmailAndPassword(auth, email, password);
      setIsAuthModalOpen(false);
      return true;
    } catch (err) {
      console.error("Firebase login failed:", err);
      throw err;
    }
  };

  const register = async (username: string, password: string): Promise<boolean> => {
    const { getFirebaseClientApp } = await import("@/lib/firebase-client");
    const app = getFirebaseClientApp();
    if (!app) {
      return mockRegister(username, password);
    }

    try {
      const { getAuth, createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth");
      const auth = getAuth(app);
      
      const email = toFirebaseEmail(username);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(result.user, {
        displayName: username.trim()
      });
      setIsAuthModalOpen(false);
      return true;
    } catch (err) {
      console.error("Firebase registration failed:", err);
      throw err;
    }
  };

  const signInWithGoogle = async (): Promise<boolean> => {
    const { getFirebaseClientApp } = await import("@/lib/firebase-client");
    const app = getFirebaseClientApp();
    if (!app) {
      console.warn("Firebase client is not configured. Simulating Google Sign-In.");
      const userObj = { username: "Google Demo" };
      setCurrentUser(userObj);
      localStorage.setItem("nexuswire-current-user", JSON.stringify(userObj));
      localStorage.setItem("nexuswire-user-name", userObj.username);
      setIsAuthModalOpen(false);
      return true;
    }

    try {
      const { getAuth, signInWithPopup, signInWithRedirect, GoogleAuthProvider } = await import("firebase/auth");
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      try {
        await signInWithPopup(auth, provider);
      } catch (err) {
        const code =
          typeof err === "object" && err !== null && "code" in err
            ? String((err as { code?: unknown }).code)
            : "";
        if (code === "auth/popup-blocked" || code === "auth/popup-closed-by-user") {
          await signInWithRedirect(auth, provider);
        } else {
          throw err;
        }
      }
      setIsAuthModalOpen(false);
      return true;
    } catch (err) {
      console.error("Google Sign-In failed:", err);
      throw err;
    }
  };

  const logout = async () => {
    const { getFirebaseClientApp } = await import("@/lib/firebase-client");
    const app = getFirebaseClientApp();
    if (!app) {
      setCurrentUser(null);
      localStorage.removeItem("nexuswire-current-user");
      localStorage.removeItem("nexuswire-active-journalist");
      localStorage.setItem("nexuswire-user-name", "Guest");
      return;
    }

    try {
      const { getAuth, signOut } = await import("firebase/auth");
      const auth = getAuth(app);
      await signOut(auth);
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  };

  const openAuth = (tab: "login" | "register" = "login") => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuth = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        isAuthModalOpen,
        authModalTab,
        login,
        register,
        signInWithGoogle,
        logout,
        openAuth,
        closeAuth,
      }}
    >
      {children}
      {isAuthModalOpen && <AuthModal />}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

function AuthModal() {
  const { authModalTab, openAuth, closeAuth, login, register, signInWithGoogle } = useUser();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(authErrorMessage(err, "google"));
    } finally {
      setLoading(false);
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (authModalTab === "login") {
        const success = await login(username, password);
        if (!success) {
          setError("Invalid username or password");
        }
      } else {
        if (password.length < 6) {
          setError("Password must be at least 6 characters");
          setLoading(false);
          return;
        }
        const success = await register(username, password);
        if (!success) {
          setError("Username already taken");
        }
      }
    } catch (err) {
      setError(authErrorMessage(err, authModalTab === "login" ? "login" : "register"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={closeAuth}
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl glass-strong p-8 fade-up z-10">
        {/* Glow Effects */}
        <div className="absolute -top-12 -left-12 h-24 w-24 rounded-full bg-[var(--accent)]/20 blur-2xl" />
        <div className="absolute -bottom-12 -right-12 h-24 w-24 rounded-full bg-[var(--gold)]/10 blur-2xl" />

        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-sm font-bold tracking-widest text-[var(--gold)] uppercase">
            {authModalTab === "login" ? "Access Terminal" : "Initialize Account"}
          </h2>
          <button
            onClick={closeAuth}
            className="rounded-full w-8 h-8 flex items-center justify-center border border-[var(--border)] text-[var(--text-muted)] hover:text-white transition-all hover:bg-white/10"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[var(--border)] mb-6">
          <button
            type="button"
            onClick={() => {
              setError("");
              setUsername("");
              setPassword("");
              openAuth("login");
            }}
            className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider transition-colors ${
              authModalTab === "login"
                ? "text-[var(--accent)] border-b-2 border-[var(--accent)]"
                : "text-[var(--text-muted)] hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setError("");
              setUsername("");
              setPassword("");
              openAuth("register");
            }}
            className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider transition-colors ${
              authModalTab === "register"
                ? "text-[var(--accent)] border-b-2 border-[var(--accent)]"
                : "text-[var(--text-muted)] hover:text-white"
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/10 p-3 text-xs text-[var(--danger)] font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. jellis"
              className="w-full"
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-2"
          >
            {loading 
              ? "Connecting..." 
              : authModalTab === "login" 
                ? "Authenticate" 
                : "Register Account"}
          </button>
        </form>

        <div className="relative my-5 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border)] opacity-60" />
          </div>
          <span className="relative bg-[#0a101c] px-3 text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
            Or continue with
          </span>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={handleGoogleSignIn}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-[var(--border)] bg-black/35 px-4 py-2.5 text-xs font-bold text-[var(--text-primary)] transition-all hover:bg-white/5 hover:border-[var(--gold)] hover:glow-border"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.19 2.7 1.24 6.636l4.026 3.129z"
            />
            <path
              fill="#4285F4"
              d="M23.455 12.273c0-.818-.073-1.609-.209-2.373H12v4.509h6.427a5.5 5.5 0 0 1-2.39 3.61l3.718 2.882c2.173-2 3.7-4.945 3.7-8.628z"
            />
            <path
              fill="#FBBC05"
              d="M5.266 14.235L1.24 17.364A11.968 11.968 0 0 1 0 12c0-1.927.455-3.745 1.24-5.364l4.026 3.129A7.056 7.056 0 0 0 4.909 12c0 1.055.227 2.055.357 2.235z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.97-1.073 7.955-2.909l-3.718-2.882c-1.03.69-2.35 1.109-3.955 1.109-3.036 0-5.618-2.055-6.536-4.818L1.24 17.636C3.19 21.3 7.27 24 12 24z"
            />
          </svg>
          <span>Google Accounts</span>
        </button>

        <p className="mt-4 text-center text-[11px] text-[var(--text-muted)]">
          {authModalTab === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <button 
                onClick={() => {
                  setError("");
                  setUsername("");
                  setPassword("");
                  openAuth("register");
                }}
                className="text-[var(--accent)] hover:underline font-bold"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button 
                onClick={() => {
                  setError("");
                  setUsername("");
                  setPassword("");
                  openAuth("login");
                }}
                className="text-[var(--accent)] hover:underline font-bold"
              >
                Log In
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
