'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AccountPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  return (
    <Card>
      <CardHeader><CardTitle>My Account</CardTitle></CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p><span className="font-medium">Name:</span> {user?.name}</p>
        <p><span className="font-medium">Email:</span> {user?.email}</p>
        <p><span className="font-medium">Role:</span> {user?.role}</p>
        <p><span className="font-medium">Branch:</span> {user?.branch_name ?? 'Not assigned'}</p>
      </CardContent>
    </Card>
  );
}
