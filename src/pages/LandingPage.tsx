import {
  FormEvent,
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router';

import {
  findProfileByEmail,
} from '../api/profiles';

import {
  getCurrentEmail,
  normaliseEmail,
  setCurrentEmail,
} from '../lib/identity';


export function LandingPage() {
  const navigate =
    useNavigate();


  const [
    email,
    setEmail,
  ] =
    useState('');


  const [
    loading,
    setLoading,
  ] =
    useState(false);


  const [
    error,
    setError,
  ] =
    useState('');


  const currentEmail =
    getCurrentEmail();


  /*
   * Returning browser:
   * skip the landing screen.
   */
  useEffect(
    () => {
      if (currentEmail) {
        navigate(
          '/applications',
          {
            replace: true,
          }
        );
      }
    },
    [
      currentEmail,
      navigate,
    ]
  );


  if (currentEmail) {
    return null;
  }


  async function submit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();


    const cleanEmail =
      normaliseEmail(
        email
      );


    if (!cleanEmail) {
      return;
    }


    setLoading(true);

    setError('');


    try {
      const profile =
        await findProfileByEmail(
          cleanEmail
        );


      if (profile) {
        setCurrentEmail(
          cleanEmail
        );

        navigate(
          '/applications'
        );

        return;
      }


      navigate(
        '/create-profile',
        {
          state: {
            email:
              cleanEmail,
          },
        }
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Unable to continue.'
      );
    } finally {
      setLoading(false);
    }
  }


  return (
    <main className="onboarding">
      <div className="onboarding-card">
        <h1>
          Welcome to Applied.
        </h1>

        <p className="muted">
          Track your job
          applications in one
          place.
        </p>


        <form
          onSubmit={submit}
        >
          <label
            htmlFor="email"
          >
            Enter your email
            to continue
          </label>

          <input
            id="email"
            type="email"
            value={email}
            required
            autoFocus
            autoComplete="email"
            maxLength={320}
            placeholder={
              'you@example.com'
            }
            disabled={loading}
            onChange={
              event =>
                setEmail(
                  event.target
                    .value
                )
            }
          />


          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Checking...'
              : 'Continue'}
          </button>


          {error && (
            <p
              role="alert"
            >
              {error}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}