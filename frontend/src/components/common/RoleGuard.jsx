import React from 'react';

export default function RoleGuard({ allowedRoles, children, fallback = null }) {
  const role = localStorage.getItem('role');
  if (allowedRoles.includes(role)) {
    return <>{children}</>;
  }
  return fallback;
}
