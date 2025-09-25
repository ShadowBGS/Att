'use client';

import {
  createContext,
  useCallback,
  useContext,
  type PropsWithChildren,
} from 'react';

import { type FirebaseApp } from 'firebase/app';
import { type Auth } from 'firebase/auth';
import { type Firestore } from 'firebase/firestore';

interface FirebaseContext {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

const Context = createContext<FirebaseContext | undefined>(undefined);

export function FirebaseProvider(
  props: PropsWithChildren<{
    app: FirebaseApp;
    auth: Auth;
    firestore: Firestore;
  }>
) {
  const { app, auth, firestore } = props;

  const context: FirebaseContext = {
    app,
    auth,
    firestore,
  };

  return <Context.Provider value={context}>{props.children}</Context.Provider>;
}

export function useFirebaseApp() {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error('useFirebaseApp must be used within a FirebaseProvider');
  }
  return context.app;
}

export function useFirestore() {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error('useFirestore must be used within a FirebaseProvider');
  }
  return context.firestore;
}

export function useAuth() {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error('useAuth must be used within a FirebaseProvider');
  }
  return context.auth;
}
