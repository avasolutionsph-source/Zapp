import { useStore } from '@/store/useStore';
import type { UserRole } from '@/types';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  /** Optional fallback to render when role is not allowed. Defaults to null (hidden). */
  fallback?: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children, fallback = null }: RoleGuardProps) {
  const { currentUser } = useStore();

  if (!currentUser) {
    return <>{fallback}</>;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
