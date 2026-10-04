import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserProfile, Reseller } from '../types';

export const ADMIN_EMAIL = 'mridoyfb@gmail.com';
export const ADMIN_PASSWORD_MATCH = 'HRidoy013166764';

export const checkIsAdmin = (email?: string | null): boolean => {
  if (!email) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
};

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  resellerProfile: Reseller | null;
  isLoading: boolean;
  isAdmin: boolean;
  isReseller: boolean;
  isApprovedReseller: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfiles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userProfile: null,
  resellerProfile: null,
  isLoading: true,
  isAdmin: false,
  isReseller: false,
  isApprovedReseller: false,
  loginWithGoogle: async () => {},
  loginWithEmail: async () => {},
  registerWithEmail: async () => {},
  logout: async () => {},
  refreshProfiles: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [resellerProfile, setResellerProfile] = useState<Reseller | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const syncUserProfile = async (user: FirebaseUser) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      const isAdministrator = checkIsAdmin(user.email);

      if (!snap.exists()) {
        const newProf: UserProfile = {
          id: user.uid,
          email: user.email || '',
          displayName: user.displayName || (isAdministrator ? 'Admin' : 'Customer'),
          photoURL: user.photoURL || '',
          role: isAdministrator ? 'admin' : 'customer',
          walletBalance: 0,
          rewardPoints: 50,
          createdAt: new Date().toISOString(),
        };
        await setDoc(userRef, newProf);
        setUserProfile(newProf);
      } else {
        const existingData = snap.data() as UserProfile;
        // Enforce strict role: ONLY mridoyfb@gmail.com can ever have role 'admin'
        const effectiveRole = isAdministrator ? 'admin' : (existingData.role === 'admin' ? 'customer' : existingData.role || 'customer');
        const updatedProf: UserProfile = {
          ...existingData,
          role: effectiveRole,
          walletBalance: existingData.walletBalance ?? 0,
          rewardPoints: existingData.rewardPoints ?? 50,
        };
        if (existingData.role !== effectiveRole) {
          await setDoc(userRef, { role: effectiveRole }, { merge: true });
        }
        setUserProfile(updatedProf);
      }
    } catch (err) {
      console.warn('Profile sync note:', err);
      const isAdministrator = checkIsAdmin(user.email);
      setUserProfile({
        id: user.uid,
        email: user.email || '',
        displayName: user.displayName || (isAdministrator ? 'Admin' : 'Customer'),
        role: isAdministrator ? 'admin' : 'customer',
        walletBalance: 0,
        rewardPoints: 50,
        createdAt: new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    // Check local session first if any
    try {
      // 1. Check if admin is currently active in this browser session
      const adminSession = sessionStorage.getItem('shoplix_admin_session');
      if (adminSession) {
        const parsed = JSON.parse(adminSession) as UserProfile;
        if (checkIsAdmin(parsed.email)) {
          setUserProfile(parsed);
          setCurrentUser({
            uid: parsed.id,
            email: parsed.email,
            displayName: parsed.displayName,
          } as any);
        }
      } else {
        // 2. Regular customer session from localStorage (never auto-load admin from permanent storage)
        const savedSession = localStorage.getItem('shoplix_local_session');
        if (savedSession) {
          const parsed = JSON.parse(savedSession) as UserProfile;
          if (parsed.role === 'admin' || checkIsAdmin(parsed.email)) {
            // Remove any legacy admin session from localStorage
            localStorage.removeItem('shoplix_local_session');
          } else {
            setUserProfile(parsed);
            setCurrentUser({
              uid: parsed.id,
              email: parsed.email,
              displayName: parsed.displayName,
            } as any);
          }
        }
      }
    } catch (e) {
      console.warn(e);
    }

    let unsubUserDoc: (() => void) | null = null;
    let unsubResellerDoc: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await syncUserProfile(user);

        unsubUserDoc = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            const isAdministrator = checkIsAdmin(data.email);
            setUserProfile({
              ...data,
              role: isAdministrator ? 'admin' : (data.role === 'admin' ? 'customer' : data.role || 'customer'),
              walletBalance: data.walletBalance ?? 0,
            });
          }
        }, (error) => {
          console.warn('User snapshot error:', error);
        });

        unsubResellerDoc = onSnapshot(doc(db, 'resellers', user.uid), (docSnap) => {
          if (docSnap.exists()) {
            setResellerProfile(docSnap.data() as Reseller);
          } else {
            setResellerProfile(null);
          }
        }, (error) => {
          console.warn('Reseller snapshot error:', error);
        });
      } else {
        const savedSession = localStorage.getItem('shoplix_local_session');
        if (!savedSession) {
          setUserProfile(null);
          setResellerProfile(null);
          setCurrentUser(null);
        }
      }
      setIsLoading(false);
    });

    return () => {
      unsubAuth();
      if (unsubUserDoc) unsubUserDoc();
      if (unsubResellerDoc) unsubResellerDoc();
    };
  }, []);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      if (res.user) {
        localStorage.removeItem('shoplix_local_session');
        await syncUserProfile(res.user);
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    // STRICT: Dedicated administrator login check
    if (cleanEmail === ADMIN_EMAIL.toLowerCase()) {
      if (pass !== ADMIN_PASSWORD_MATCH) {
        setIsLoading(false);
        throw new Error('ভুল এডমিন ইমেইল অথবা পাসওয়ার্ড।');
      }

      // Authenticate as Admin (session only, not persisted across cold browser restarts)
      const adminProfile: UserProfile = {
        id: 'admin_mridoyfb',
        email: ADMIN_EMAIL,
        displayName: 'Mridoy (Admin)',
        role: 'admin',
        walletBalance: 0,
        createdAt: new Date().toISOString(),
      };
      sessionStorage.setItem('shoplix_admin_session', JSON.stringify(adminProfile));
      localStorage.removeItem('shoplix_local_session');
      setUserProfile(adminProfile);
      setCurrentUser({
        uid: adminProfile.id,
        email: adminProfile.email,
        displayName: adminProfile.displayName,
      } as any);

      try {
        await setDoc(doc(db, 'users', adminProfile.id), adminProfile, { merge: true });
      } catch (e) {
        // ignorable
      }
      setIsLoading(false);
      return;
    }

    // Regular users / customers
    try {
      const res = await signInWithEmailAndPassword(auth, email.trim(), pass);
      if (res.user) {
        localStorage.removeItem('shoplix_local_session');
        await syncUserProfile(res.user);
      }
    } catch (error: any) {
      // Local registry fallback for seamless accounts
      const localUsersKey = 'shoplix_registered_users';
      const localUsers = JSON.parse(localStorage.getItem(localUsersKey) || '[]');
      const found = localUsers.find(
        (u: any) => u.email.toLowerCase() === cleanEmail && u.password === pass
      );

      if (found) {
        const isAdministrator = checkIsAdmin(found.email);
        const prof: UserProfile = {
          id: found.id,
          email: found.email,
          displayName: found.name,
          role: isAdministrator ? 'admin' : 'customer',
          walletBalance: found.walletBalance ?? 0,
          rewardPoints: found.rewardPoints ?? 50,
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem('shoplix_local_session', JSON.stringify(prof));
        setUserProfile(prof);
        setCurrentUser({
          uid: prof.id,
          email: prof.email,
          displayName: prof.displayName,
        } as any);
        setIsLoading(false);
        return;
      }

      console.error('Email sign in error:', error);
      throw new Error(
        error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password'
          ? 'ভুল ইমেইল অথবা পাসওয়ার্ড। অনুগ্রহ করে আবার চেষ্টা করুন।'
          : error.message || 'লগইন ব্যর্থ হয়েছে।'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    if (pass.length < 6) {
      setIsLoading(false);
      throw new Error('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
    }

    // Non-admin email registration
    const isAdministrator = checkIsAdmin(cleanEmail);

    let createdUser: any = null;

    try {
      const res = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      if (res.user) {
        await updateProfile(res.user, { displayName: name.trim() });
        await syncUserProfile(res.user);
        createdUser = res.user;
      }
    } catch (error: any) {
      console.warn('Firebase createUser note (using seamless fallback):', error);

      if (error.code === 'auth/email-already-in-use') {
        setIsLoading(false);
        throw new Error('এই ইমেইলটি ইতিমধ্যে ব্যবহৃত হয়েছে। অনুগ্রহ করে লগইন করুন।');
      }

      // Generate local customer record
      const localId = `user_${Date.now()}`;
      const newCustomer: UserProfile = {
        id: localId,
        email: cleanEmail,
        displayName: name.trim(),
        role: isAdministrator ? 'admin' : 'customer',
        walletBalance: 0,
        rewardPoints: 50,
        createdAt: new Date().toISOString(),
      };

      // Save to local registry
      const localUsersKey = 'shoplix_registered_users';
      const localUsers = JSON.parse(localStorage.getItem(localUsersKey) || '[]');
      localUsers.push({
        id: localId,
        email: cleanEmail,
        password: pass,
        name: name.trim(),
        walletBalance: 0,
        rewardPoints: 50,
      });
      localStorage.setItem(localUsersKey, JSON.stringify(localUsers));

      localStorage.setItem('shoplix_local_session', JSON.stringify(newCustomer));
      setUserProfile(newCustomer);
      setCurrentUser({
        uid: newCustomer.id,
        email: newCustomer.email,
        displayName: newCustomer.displayName,
      } as any);

      try {
        await setDoc(doc(db, 'users', localId), newCustomer);
      } catch (dbErr) {
        console.warn('DB setDoc note:', dbErr);
      }

      setIsLoading(false);
      return;
    }

    // Save in local database backup as well
    const localUsersKey = 'shoplix_registered_users';
    const localUsers = JSON.parse(localStorage.getItem(localUsersKey) || '[]');
    localUsers.push({
      id: createdUser?.uid || `user_${Date.now()}`,
      email: cleanEmail,
      password: pass,
      name: name.trim(),
      walletBalance: 0,
      rewardPoints: 50,
    });
    localStorage.setItem(localUsersKey, JSON.stringify(localUsers));

    setIsLoading(false);
  };

  const logout = async () => {
    localStorage.removeItem('shoplix_local_session');
    sessionStorage.removeItem('shoplix_admin_session');
    try {
      await signOut(auth);
    } catch (e) {
      // ignorable
    }
    setUserProfile(null);
    setResellerProfile(null);
    setCurrentUser(null);
  };

  const refreshProfiles = async () => {
    if (currentUser) {
      await syncUserProfile(currentUser);
    }
  };

  const userEmail = currentUser?.email || userProfile?.email;
  // STRICT: isAdmin is ONLY true if user email is strictly mridoyfb@gmail.com
  const isAdmin = checkIsAdmin(userEmail);
  const isReseller = !!resellerProfile || userProfile?.role === 'reseller';
  const isApprovedReseller = resellerProfile?.status === 'approved';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        resellerProfile,
        isLoading,
        isAdmin,
        isReseller,
        isApprovedReseller,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
        refreshProfiles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
