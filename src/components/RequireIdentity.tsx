import {
  Navigate,
  Outlet,
} from 'react-router';

import {
  getCurrentEmail,
} from '../lib/identity';


export function RequireIdentity() {
  const email =
    getCurrentEmail();


  if (!email) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }


  return <Outlet />;
}