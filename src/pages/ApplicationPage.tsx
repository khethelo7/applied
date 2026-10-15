import {
  useEffect,
  useState,
} from 'react';

import {
  Link,
  useNavigate,
  useParams,
} from 'react-router';

import {
  useApplications,
} from '../hooks/useApplications';

import {
  StageBadge,
} from '../components/StageBadge';

import {
  STAGES,
  type Stage,
} from '../types';

import {
  daysSince,
  needsNudge,
} from '../lib/applications';

function getToday() {
  const today =
    new Date();

  const year =
    today.getFullYear();

  const month =
    String(
      today.getMonth() + 1
    ).padStart(
      2,
      '0'
    );

  const day =
    String(
      today.getDate()
    ).padStart(
      2,
      '0'
    );

  return `${year}-${month}-${day}`;
}

export function ApplicationPage() {
  const { id } =
    useParams();

  const navigate =
    useNavigate();

  const {
    applications,
    loading,
    saving,
    error,
    update,
    remove,
  } = useApplications();

  const job =
    applications.find(
      application =>
        application.id === id
    );

  const [
    notes,
    setNotes,
  ] = useState('');

  const [
    stage,
    setStage,
  ] =
    useState<Stage>(
      'wishlist'
    );

  const [
    dateSent,
    setDateSent,
  ] = useState('');

  const [
    validationError,
    setValidationError,
  ] = useState('');

  const [
    confirm,
    setConfirm,
  ] = useState(false);

  /*
   * Populate the editable controls whenever
   * we load/change application.
   */
  useEffect(() => {
    if (!job) return;

    setNotes(
      job.notes ?? ''
    );

    setStage(
      job.stage
    );

    setDateSent(
      job.dateSent
    );
  }, [
    job?.id,
    job?.notes,
    job?.stage,
    job?.dateSent,
  ]);

  if (loading) {
    return (
      <p role="status">
        Loading application...
      </p>
    );
  }

  if (!job) {
    return (
      <main>
        <h1>
          We could not find
          that application
        </h1>

        <Link to="/">
          Back to all applications
        </Link>
      </main>
    );
  }

  async function saveChanges() {
    if (!id) return;

    /*
     * Once something has been submitted,
     * it needs a submission date.
     */
    if (
      stage !== 'wishlist' &&
      !dateSent
    ) {
      setValidationError(
        'Date sent is required once an application has been submitted.'
      );

      return;
    }

    /*
     * Prevent impossible future dates.
     */
    if (
      dateSent &&
      dateSent > getToday()
    ) {
      setValidationError(
        'Date sent cannot be in the future.'
      );

      return;
    }

    setValidationError('');

    try {
      await update(
        id,
        {
          notes,
          stage,
          dateSent,
        }
      );
    } catch {
      /*
       * useApplications already stores
       * the error for us.
       */
    }
  }

  async function deleteJob() {
    if (!id) return;

    try {
      await remove(id);

      navigate('/');
    } catch {
      /*
       * Error is displayed below.
       */
    }
  }

  return (
    <main>
      <Link to="/">
        Back to applications
      </Link>

      <h1>
        {job.company}
      </h1>

      <h2>
        {job.role}
      </h2>

      <StageBadge
        stage={job.stage}
      />

      <p>
        {job.dateSent
          ? `Sent ${job.dateSent} · ${daysSince(job.dateSent)} days ago`
          : 'Not sent yet'}
      </p>

      {needsNudge(job) && (
        <p className="nudge">
          Needs a nudge
        </p>
      )}

      {job.link && (
        <p>
          <a
            href={job.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            View advert ↗
          </a>
        </p>
      )}

      <div className="panel form">

        <label htmlFor="stage">
          Stage
        </label>

        <select
          id="stage"
          value={stage}
          disabled={saving}
          onChange={event =>
            setStage(
              event.target
                .value as Stage
            )
          }
        >
          {STAGES.map(
            option => (
              <option
                key={option}
                value={option}
              >
                {option ===
                'wishlist'
                  ? 'Saved'
                  : option}
              </option>
            )
          )}
        </select>

        <label htmlFor="dateSent">
          Date sent{' '}
          {stage !== 'wishlist'
            ? '*'
            : '(not sent yet)'}
        </label>

        <input
          id="dateSent"
          type="date"
          max={getToday()}
          value={dateSent}
          disabled={saving}
          onChange={event =>
            setDateSent(
              event.target.value
            )
          }
        />

        <label htmlFor="notes">
          Notes
        </label>

        <textarea
          id="notes"
          value={notes}
          disabled={saving}
          rows={5}
          maxLength={10_000}
          onChange={event =>
            setNotes(
              event.target.value
            )
          }
        />

        <button
          disabled={saving}
          onClick={() =>
            void saveChanges()
          }
        >
          {saving
            ? 'Saving...'
            : 'Save changes'}
        </button>

        {validationError && (
          <p role="alert">
            {validationError}
          </p>
        )}

        {error && (
          <p role="alert">
            {error}
          </p>
        )}

        <hr />

        {confirm ? (
          <div
            role="group"
            aria-label="Confirm deletion"
          >
            <p>
              Delete this application
              permanently?
            </p>

            <button
              className="danger"
              disabled={saving}
              onClick={() =>
                void deleteJob()
              }
            >
              {saving
                ? 'Deleting...'
                : 'Yes, delete'}
            </button>

            <button
              disabled={saving}
              onClick={() =>
                setConfirm(false)
              }
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            className="danger"
            disabled={saving}
            onClick={() =>
              setConfirm(true)
            }
          >
            Delete this application
          </button>
        )}

      </div>
    </main>
  );
}