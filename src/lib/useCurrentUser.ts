import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'plantdex.currentUser';
export const KNOWN_USERS = ['Me', 'Ashley'];

export function useCurrentUser() {
  const [user, setUserState] = useState<string>(() => {
    if (typeof window === 'undefined') return KNOWN_USERS[0];
    return window.localStorage.getItem(STORAGE_KEY) || KNOWN_USERS[0];
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, user);
  }, [user]);

  const setUser = useCallback((name: string) => setUserState(name), []);

  return { user, setUser };
}
