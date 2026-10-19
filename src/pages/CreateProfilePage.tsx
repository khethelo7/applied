import {
  useState,
} from 'react';

import {
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router';

import {
  createProfile,
} from '../api/profiles';

import {
  setCurrentEmail,
} from '../lib/identity';


type LocationState = {
  email?: string;
};


export function CreateProfilePage() {
  const location =
    useLocation();


  const navigate =
    useNavigate();


  const [
    saving,
    setSaving,
  ] =
    useState(false);


  const [
    error,
    setError,
  ] =
    useState('');


  const state =
    location.state as
      LocationState |
      null;


  const email =
    state?.email;


  /*
   * They refreshed this intermediate
   * screen or opened it directly.
   */
  if (!email) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }


  async function accept() {
    setSaving(true);

    setError('');


    try {
      await createProfile(
        email
      );


      setCurrentEmail(
        email
      );


      navigate(
        '/applications',
        {
          replace: true,
        }
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Unable to create profile.'
      );

      setSaving(false);
    }
  }


  function decline() {
    navigate(
      '/no-actions',
      {
        replace: true,
      }
    );
  }


  return (
    <main className="onboarding">
      <div className="onboarding-card">
        <h1>
          Create your workspace?
        </h1>


        <p>
          We couldn't find
          this email in our
          records.
        </p>


        <p>
          Would you like to
          save this email and
          create a workspace?
        </p>


        <div
          className=
            "email-preview"
        >
          {email}
        </div>


        <div
          className=
            "onboarding-actions"
        >
          <button
            type="button"
            disabled={saving}
            onClick={
              () =>
                void accept()
            }
          >
            {saving
              ? 'Creating...'
              : 'Yes, continue'}
          </button>


          <button
            type="button"
            className="secondary"
            disabled={saving}
            onClick={decline}
          >
            No, thanks
          </button>
        </div>


        {error && (
          <p role="alert">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}