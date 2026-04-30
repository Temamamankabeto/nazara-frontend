'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/layouts';
import { logoutReduxAction, setUser } from '@/stores/slices/userSlice';
import { getToken, getUserFromLocalStorage } from '@/lib/utils';
import Loader from '@/components/Loader';
import { RootState } from '@/stores';
import { fetchAuthenticatedUser } from '@/services/auth.service';

export default function Layout({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/auth/login');
      return;
    }

    if (currentUser) {
      setLoading(false);
      return;
    }

    const storedUser = getUserFromLocalStorage();
    if (storedUser) {
      dispatch(setUser({ user: storedUser }));
      setLoading(false);
      return;
    }

    fetchAuthenticatedUser()
      .then((user) => dispatch(setUser({ user })))
      .catch(() => {
        dispatch(logoutReduxAction());
        router.push('/auth/login');
      })
      .finally(() => setLoading(false));
  }, [dispatch, router, currentUser]);

  if (loading) return <Loader />;
  return <DashboardLayout>{children}</DashboardLayout>;
}
