import { seed } from '../data/seed';
import {
  STAGES,
  type Application,
  type NewApplication,
  type Stage,
} from '../types';

const KEY = 'applied-applications-v1';

const MAX_COMPANY_LENGTH = 120;
const MAX_ROLE_LENGTH = 160;
const MAX_LINK_LENGTH = 2048;
const MAX_NOTES_LENGTH = 10_000;

/*
|--------------------------------------------------------------------------
| Storage helpers
|--------------------------------------------------------------------------
*/

function storageError(
  action: 'read' | 'write',
  cause: unknown
): Error {
  console.error(
    `Unable to ${action} application storage`,
    cause
  );

  return new Error(
    action === 'read'
      ? 'Unable to read saved applications from this browser.'
      : 'Unable to save applications. Browser storage may be full or unavailable.'
  );
}

function getItem(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch (error) {
    throw storageError('read', error);
  }
}

function setItem(value: string): void {
  try {
    localStorage.setItem(KEY, value);
  } catch (error) {
    throw storageError('write', error);
  }
}

/*
|--------------------------------------------------------------------------
| Validation
|--------------------------------------------------------------------------
*/

function isStage(value: unknown): value is Stage {
  return (
    typeof value === 'string' &&
    (STAGES as readonly string[]).includes(value)
  );
}

function isSafeHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return (
      url.protocol === 'http:' ||
      url.protocol === 'https:'
    );
  } catch {
    return false;
  }
}

function validateApplication(
  value: unknown
): Application {
  if (
    !value ||
    typeof value !== 'object'
  ) {
    throw new Error(
      'A saved application has an invalid format.'
    );
  }

  const job = value as Record<string, unknown>;

  if (
    typeof job.id !== 'string' ||
    !job.id
  ) {
    throw new Error(
      'A saved application is missing its ID.'
    );
  }

  if (
    typeof job.company !== 'string' ||
    !job.company.trim()
  ) {
    throw new Error(
      'A saved application is missing its company name.'
    );
  }

  if (
    typeof job.role !== 'string' ||
    !job.role.trim()
  ) {
    throw new Error(
      'A saved application is missing its job title.'
    );
  }

  if (
    typeof job.dateSent !== 'string'
  ) {
    throw new Error(
      'A saved application has an invalid sent date.'
    );
  }

  if (!isStage(job.stage)) {
    throw new Error(
      'A saved application has an invalid stage.'
    );
  }

  if (
    typeof job.createdAt !== 'string' ||
    Number.isNaN(Date.parse(job.createdAt))
  ) {
    throw new Error(
      'A saved application has an invalid creation date.'
    );
  }

  if (
    job.link !== undefined &&
    (
      typeof job.link !== 'string' ||
      !isSafeHttpUrl(job.link)
    )
  ) {
    throw new Error(
      'A saved application has an invalid advert link.'
    );
  }

  if (
    job.notes !== undefined &&
    typeof job.notes !== 'string'
  ) {
    throw new Error(
      'A saved application has invalid notes.'
    );
  }

  return job as unknown as Application;
}

/*
|--------------------------------------------------------------------------
| Read / write
|--------------------------------------------------------------------------
*/

function read(): Application[] {
  const raw = getItem();

  /*
   * First ever visit:
   * populate localStorage with the seed applications.
   */
  if (raw === null) {
    const initial = seed.map((job) => ({
      ...job,
    }));

    setItem(JSON.stringify(initial));

    return initial;
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    console.error(
      'Saved application data is not valid JSON',
      error
    );

    throw new Error(
      'Saved application data is corrupted and could not be loaded.'
    );
  }

  if (!Array.isArray(parsed)) {
    throw new Error(
      'Saved applications are not a list.'
    );
  }

  /*
   * Do not blindly trust localStorage.
   *
   * Users can edit it manually and older versions of the
   * application could theoretically have stored bad data.
   */
  const jobs = parsed.map(
    validateApplication
  );

  /*
   * IDs must be unique.
   *
   * Duplicate IDs can cause React rendering problems and
   * can make deletion/update operations ambiguous.
   */
  const ids = new Set<string>();

  for (const job of jobs) {
    if (ids.has(job.id)) {
      throw new Error(
        `Saved application data contains a duplicate ID: ${job.id}`
      );
    }

    ids.add(job.id);
  }

  return jobs;
}

function write(
  jobs: Application[]
): void {
  setItem(
    JSON.stringify(jobs)
  );
}

/*
|--------------------------------------------------------------------------
| Input cleanup
|--------------------------------------------------------------------------
*/

function normaliseNewApplication(
  input: NewApplication
): NewApplication {
  const company = input.company.trim();
  const role = input.role.trim();

  const link =
    input.link?.trim() ||
    undefined;

  const notes =
    input.notes?.trim() ||
    undefined;

  const dateSent =
    input.dateSent.trim();

  if (!company) {
    throw new Error(
      'Company is required.'
    );
  }

  if (
    company.length >
    MAX_COMPANY_LENGTH
  ) {
    throw new Error(
      'Company name is too long.'
    );
  }

  if (!role) {
    throw new Error(
      'Job title is required.'
    );
  }

  if (
    role.length >
    MAX_ROLE_LENGTH
  ) {
    throw new Error(
      'Job title is too long.'
    );
  }

  if (!isStage(input.stage)) {
    throw new Error(
      'Application stage is invalid.'
    );
  }

  if (
    link &&
    (
      !isSafeHttpUrl(link) ||
      link.length > MAX_LINK_LENGTH
    )
  ) {
    throw new Error(
      'Advert link must be a valid http or https URL.'
    );
  }

  if (
    notes &&
    notes.length >
    MAX_NOTES_LENGTH
  ) {
    throw new Error(
      'Notes are too long.'
    );
  }

  /*
   * Wishlist applications have not necessarily
   * been submitted yet.
   *
   * Every later stage must have a sent date.
   */
  if (
    input.stage !== 'wishlist' &&
    !dateSent
  ) {
    throw new Error(
      'Date sent is required once an application has been submitted.'
    );
  }

  return {
    company,
    role,
    link,
    dateSent,
    stage: input.stage,
    notes,
  };
}

/*
|--------------------------------------------------------------------------
| Public API
|--------------------------------------------------------------------------
*/

export async function fetchApplications():
Promise<Application[]> {
  return read();
}

export async function createApplication(
  input: NewApplication
): Promise<Application> {
  const cleanInput =
    normaliseNewApplication(input);

  /*
   * Read BEFORE constructing our final list.
   */
  const jobs = read();

  const job: Application = {
    ...cleanInput,

    id: crypto.randomUUID(),

    createdAt:
      new Date().toISOString(),
  };

  write([
    job,
    ...jobs,
  ]);

  return job;
}

export async function updateApplication(
  id: string,
  changes: Partial<Application>
): Promise<Application> {
  const jobs = read();

  const index =
    jobs.findIndex(
      (job) => job.id === id
    );

  if (index < 0) {
    throw new Error(
      'Application not found.'
    );
  }

  const current =
    jobs[index];

  /*
   * We deliberately construct the editable fields.
   *
   * We do NOT allow id or createdAt to be overwritten.
   */
  const merged: Application = {
    ...current,

    company:
      typeof changes.company === 'string'
        ? changes.company
        : current.company,

    role:
      typeof changes.role === 'string'
        ? changes.role
        : current.role,

    link:
      changes.link !== undefined
        ? changes.link
        : current.link,

    dateSent:
      typeof changes.dateSent === 'string'
        ? changes.dateSent
        : current.dateSent,

    stage:
      changes.stage ??
      current.stage,

    notes:
      changes.notes !== undefined
        ? changes.notes
        : current.notes,

    /*
     * Protected values.
     */
    id: current.id,
    createdAt: current.createdAt,
  };

  /*
   * Run the updated record through the same
   * validation as a newly-created application.
   */
  const clean =
    normaliseNewApplication(merged);

  const updated: Application = {
    ...clean,

    id: current.id,
    createdAt:
      current.createdAt,
  };

  jobs[index] =
    updated;

  write(jobs);

  return updated;
}

export async function deleteApplication(
  id: string
): Promise<void> {
  const jobs = read();

  const index =
    jobs.findIndex(
      (job) => job.id === id
    );

  if (index < 0) {
    throw new Error(
      'Application not found.'
    );
  }

  /*
   * Remove EXACTLY ONE application.
   *
   * This makes the intention extremely explicit and prevents
   * another accidental reversed filter condition.
   */
  jobs.splice(index, 1);

  write(jobs);
}

/*
 * Exported so our storage hook/tests can listen for changes
 * without duplicating the key string elsewhere.
 */
export const APPLICATIONS_STORAGE_KEY =
  KEY;