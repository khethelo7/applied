import {
  Link,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router';


import {
  ThemeToggle,
} from './components/ThemeToggle';

import {
  RequireIdentity,
} from './components/RequireIdentity';


import {
  LandingPage,
} from './pages/LandingPage';

import {
  CreateProfilePage,
} from './pages/CreateProfilePage';

import {
  NoActionsPage,
} from './pages/NoActionsPage';

import {
  ApplicationsPage,
} from './pages/ApplicationsPage';

import {
  ApplicationPage,
} from './pages/ApplicationPage';

import {
  NewApplicationPage,
} from './pages/NewApplicationPage';

import {
  NotFoundPage,
} from './pages/NotFoundPage';


import {
  clearCurrentEmail,
  getCurrentEmail,
} from './lib/identity';


function Layout() {
  const navigate =
    useNavigate();


  const location =
    useLocation();


  const email =
    getCurrentEmail();


  const inApplications =
    location.pathname
      .startsWith(
        '/applications'
      );


  function switchUser() {
    clearCurrentEmail();

    navigate(
      '/',
      {
        replace: true,
      }
    );
  }


  return (
    <>
      <header
        className="header"
      >
        <Link
          className="brand"
          to={
            email
              ? '/applications'
              : '/'
          }
        >
          Applied.
        </Link>


        <nav>
          {email &&
            inApplications && (
              <span
                className=
                  "current-email"
              >
                {email}
              </span>
            )}


          <ThemeToggle />


          {email &&
            inApplications && (
              <>
                <button
                  type="button"
                  className=
                    "secondary"
                  onClick={
                    switchUser
                  }
                >
                  Switch user
                </button>


                <Link
                  className="button"
                  to=
                    "/applications/new"
                >
                  + Add application
                </Link>
              </>
            )}
        </nav>
      </header>


      <Outlet />
    </>
  );
}


export default function App() {
  return (
    <Routes>
      <Route
        element={
          <Layout />
        }
      >
        <Route
          index
          element={
            <LandingPage />
          }
        />


        <Route
          path="create-profile"
          element={
            <CreateProfilePage />
          }
        />


        <Route
          path="no-actions"
          element={
            <NoActionsPage />
          }
        />


        <Route
          element={
            <RequireIdentity />
          }
        >
          <Route
            path="applications"
            element={
              <ApplicationsPage />
            }
          />


          <Route
            path=
              "applications/new"
            element={
              <NewApplicationPage />
            }
          />


          <Route
            path=
              "applications/:id"
            element={
              <ApplicationPage />
            }
          />
        </Route>


        <Route
          path="*"
          element={
            <NotFoundPage />
          }
        />
      </Route>
    </Routes>
  );
}