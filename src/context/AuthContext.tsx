import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebase.ts';
import {
  registerWithBackend,
  loginWithBackend,
  fetchCurrentUser,
  logoutBackend,
  resetPasswordBackend,
  getStoredCachedUser,
  AuthUser,
} from '../services/authApi.ts';

export interface UserMinimal {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface UserProfileData {
  userId: string;
  email: string;
  displayName: string;
  createdAt?: string;
  lastLogin?: string;
}

interface AuthContextType {
  user: User | UserMinimal | null;
  profile: UserProfileData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  logout: () => Promise<void>;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'register';
  setAuthModalMode: (mode: 'login' | 'register') => void;
  openLoginModal: () => void;
  openRegisterModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | UserMinimal | null>(() => getStoredCachedUser());
  const [profile, setProfile] = useState<UserProfileData | null>(() => {
    const cached = getStoredCachedUser();
    return cached
      ? {
          userId: cached.uid,
          email: cached.email,
          displayName: cached.displayName,
        }
      : null;
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Initialize session: Check backend token and Firebase Auth
  useEffect(() => {
    let mounted = true;

    async function initializeSession() {
      // 1. Check backend token session
      try {
        const backendUser = await fetchCurrentUser();
        if (mounted && backendUser) {
          setUser({
            uid: backendUser.uid,
            email: backendUser.email,
            displayName: backendUser.displayName,
          });
          setProfile({
            userId: backendUser.uid,
            email: backendUser.email,
            displayName: backendUser.displayName,
          });
          setLoading(false);
          return;
        }
      } catch {
        // Continue to Firebase Auth check
      }

      // 2. Fallback to Firebase onAuthStateChanged if active
      if (!auth) {
        const cached = getStoredCachedUser();
        if (cached && mounted) {
          setUser({
            uid: cached.uid,
            email: cached.email,
            displayName: cached.displayName,
          });
          setProfile({
            userId: cached.uid,
            email: cached.email,
            displayName: cached.displayName,
          });
        }
        if (mounted) setLoading(false);
        return;
      }

      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (!mounted) return;
        if (currentUser) {
          setUser(currentUser);
          if (db) {
            try {
              const userDocRef = doc(db, 'users', currentUser.uid);
              const snap = await getDoc(userDocRef);
              if (snap.exists()) {
                setProfile(snap.data() as UserProfileData);
              } else {
                const newProfile: UserProfileData = {
                  userId: currentUser.uid,
                  email: currentUser.email || '',
                  displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
                  createdAt: new Date().toISOString(),
                };
                await setDoc(userDocRef, {
                  ...newProfile,
                  createdAtServer: serverTimestamp(),
                });
                setProfile(newProfile);
              }
            } catch {
              setProfile({
                userId: currentUser.uid,
                email: currentUser.email || '',
                displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
              });
            }
          } else {
            setProfile({
              userId: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
            });
          }
        } else {
          // If no backend session and no Firebase user
          const cached = getStoredCachedUser();
          if (!cached) {
            setUser(null);
            setProfile(null);
          }
        }
        setLoading(false);
      });

      return () => unsubscribe();
    }

    initializeSession();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Primary: Login via secure backend auth
    let backendSuccess = false;
    try {
      const { user: authUser } = await loginWithBackend(normalizedEmail, password);
      setUser({
        uid: authUser.uid,
        email: authUser.email,
        displayName: authUser.displayName,
      });
      setProfile({
        userId: authUser.uid,
        email: authUser.email,
        displayName: authUser.displayName,
      });
      backendSuccess = true;
    } catch (backendErr: any) {
      // If backend reports invalid credentials, throw directly
      if (backendErr.status === 401 || backendErr.message?.includes('Invalid email or password')) {
        throw new Error('Invalid email or password combination. Please try again.');
      }
      // If it's a validation error, throw directly
      if (backendErr.status === 400) {
        throw backendErr;
      }
      // If network error, preserve network error message
      if (backendErr.isNetworkError) {
        throw backendErr;
      }
      throw backendErr;
    }

    // 2. Secondary: If Firebase Email/Password is also active, authenticate Firebase user
    if (backendSuccess && auth) {
      try {
        await signInWithEmailAndPassword(auth, normalizedEmail, password);
      } catch {
        // Silently tolerate if Firebase email auth is not enabled in Firebase console
      }
    }
  };

  const register = async (email: string, password: string, displayName?: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const resolvedName = displayName?.trim() || normalizedEmail.split('@')[0];

    // 1. Primary: Register via secure backend auth
    try {
      const { user: authUser } = await registerWithBackend(resolvedName, normalizedEmail, password);
      setUser({
        uid: authUser.uid,
        email: authUser.email,
        displayName: authUser.displayName,
      });
      const newProfile: UserProfileData = {
        userId: authUser.uid,
        email: authUser.email,
        displayName: authUser.displayName,
        createdAt: new Date().toISOString(),
      };
      setProfile(newProfile);
    } catch (backendErr: any) {
      if (backendErr.status === 409) {
        throw new Error('An account with this email address already exists. Please sign in instead.');
      }
      if (backendErr.status === 400) {
        throw new Error(backendErr.message || 'Please verify the registration details.');
      }
      if (backendErr.isNetworkError) {
        throw backendErr;
      }
      throw backendErr;
    }

    // 2. Secondary: If Firebase Auth is enabled in the Firebase project, register with Firebase as well
    if (auth) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
        if (userCredential?.user) {
          try {
            await updateProfile(userCredential.user, { displayName: resolvedName });
          } catch {
            // Non-critical
          }
          if (db) {
            try {
              const userDocRef = doc(db, 'users', userCredential.user.uid);
              await setDoc(userDocRef, {
                userId: userCredential.user.uid,
                email: normalizedEmail,
                displayName: resolvedName,
                createdAt: new Date().toISOString(),
                createdAtServer: serverTimestamp(),
              });
            } catch {
              // Non-critical
            }
          }
        }
      } catch {
        // Silently tolerate if Firebase console email auth is disabled; backend auth guarantees 100% operation
      }
    }
  };

  const resetPassword = async (email: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    await resetPasswordBackend(normalizedEmail);

    if (auth) {
      try {
        await sendPasswordResetEmail(auth, normalizedEmail);
      } catch {
        // Handled by backend reset response
      }
    }
  };

  const sendVerificationEmail = async () => {
    if (auth?.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
      } catch {
        // Non-blocking
      }
    }
  };

  const logout = async () => {
    await logoutBackend();
    if (auth) {
      try {
        await signOut(auth);
      } catch {
        // Non-blocking
      }
    }
    setUser(null);
    setProfile(null);
  };

  const openLoginModal = () => {
    setAuthModalMode('login');
    setAuthModalOpen(true);
  };

  const openRegisterModal = () => {
    setAuthModalMode('register');
    setAuthModalOpen(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        register,
        resetPassword,
        sendVerificationEmail,
        logout,
        authModalOpen,
        setAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openLoginModal,
        openRegisterModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
