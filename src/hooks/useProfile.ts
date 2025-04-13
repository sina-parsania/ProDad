'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, saveUser, savePartner } from '@/lib/db/db';
import { User, Partner } from '@/types/user';

export function useProfile() {
  const user = useLiveQuery(() => db.users.toArray().then((users) => users[0]));
  const partner = useLiveQuery(() => db.partners.toArray().then((partners) => partners[0]));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (user !== undefined && partner !== undefined) {
      setLoading(false);
    }
  }, [user, partner]);

  // Initialize with default data if none exists
  useEffect(() => {
    const initializeData = async () => {
      try {
        const users = await db.users.toArray();
        const partners = await db.partners.toArray();

        if (users.length === 0) {
          // Create default user
          await saveUser({
            firstName: 'Your',
            lastName: 'Name',
            updatedAt: new Date(),
          });
        }

        if (partners.length === 0) {
          // Create default partner
          await savePartner({
            firstName: 'Partner',
            lastName: 'Name',
            status: 'planning',
            updatedAt: new Date(),
          });
        }
      } catch (err) {
        console.error('Error initializing profile data:', err);
      }
    };

    initializeData();
  }, []);

  const updateUser = useCallback(
    async (userData: Partial<User>) => {
      try {
        if (!user) {
          throw new Error('No user found to update');
        }

        const updatedUser: User = {
          ...user,
          ...userData,
          updatedAt: new Date(),
        };

        await saveUser(updatedUser);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error updating user'));
        throw err;
      }
    },
    [user],
  );

  const updatePartner = useCallback(
    async (partnerData: Partial<Partner>) => {
      try {
        if (!partner) {
          throw new Error('No partner found to update');
        }

        const updatedPartner: Partner = {
          ...partner,
          ...partnerData,
          updatedAt: new Date(),
        };

        await savePartner(updatedPartner);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error updating partner'));
        throw err;
      }
    },
    [partner],
  );

  return {
    user: user || null,
    partner: partner || null,
    loading,
    error,
    updateUser,
    updatePartner,
  };
}
