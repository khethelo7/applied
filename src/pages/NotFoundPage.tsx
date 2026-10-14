import { Link } from "react-router";

export function NotFoundPage() {
  return (
    <main className="center">
      <h1>That page does not exist</h1>

      <p>
        You may have followed an old link or mistyped the address.
      </p>

      <Link to="/">
        Back to all applications
      </Link>
    </main>
  );
}