import {
  Link,
} from 'react-router';


export function NoActionsPage() {
  return (
    <main className="onboarding">
      <div className="onboarding-card">
        <h1>
          No further actions
        </h1>

        <p className="muted">
          You chose not to save
          this email.
        </p>

        <p>
          There are no further
          actions to complete.
        </p>

        <Link
          className="button"
          to="/"
        >
          Go back
        </Link>
      </div>
    </main>
  );
}