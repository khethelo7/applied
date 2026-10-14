import { Link, Outlet, Route, Routes } from "react-router";

import { ThemeToggle } from "./components/ThemeToggle";

import { ApplicationsPage } from "./pages/ApplicationsPage";
import { ApplicationPage } from "./pages/ApplicationPage";
import { NewApplicationPage } from "./pages/NewApplicationPage";
import { NotFoundPage } from "./pages/NotFoundPage";

function Layout() {
  return (
    <>
      <header className="header">
        <Link className="brand" to="/">
          Applied.
        </Link>

        <nav>
          <ThemeToggle />

          <Link className="button" to="/new">
            + Add application
          </Link>
        </nav>
      </header>

      <Outlet />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route
          index
          element={<ApplicationsPage />}
        />

        <Route
          path="new"
          element={<NewApplicationPage />}
        />

        <Route
          path="applications/:id"
          element={<ApplicationPage />}
        />

        <Route
          path="*"
          element={<NotFoundPage />}
        />
      </Route>
    </Routes>
  );
}