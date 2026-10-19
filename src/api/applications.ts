import {
  supabase,
} from '../lib/supabase';

import {
  getCurrentEmail,
} from '../lib/identity';

import {
  findProfileByEmail,
} from './profiles';

import {
  STAGES,
  type Application,
  type NewApplication,
  type Stage,
} from '../types';


const MAX_COMPANY_LENGTH =
  120;

const MAX_ROLE_LENGTH =
  160;

const MAX_LINK_LENGTH =
  2048;

const MAX_NOTES_LENGTH =
  10_000;


/*
|--------------------------------------------------------------------------
| Database row
|--------------------------------------------------------------------------
*/

type ApplicationRow = {
  id: string;

  profile_id: string;

  company: string;

  role: string;

  link: string | null;

  date_sent: string | null;

  stage: Stage;

  notes: string | null;

  created_at: string;
};


/*
|--------------------------------------------------------------------------
| Mapping
|--------------------------------------------------------------------------
*/

function mapApplication(
  row: ApplicationRow
): Application {
  return {
    id:
      row.id,

    company:
      row.company,

    role:
      row.role,

    link:
      row.link ??
      undefined,

    dateSent:
      row.date_sent ??
      '',

    stage:
      row.stage,

    notes:
      row.notes ??
      undefined,

    createdAt:
      row.created_at,
  };
}


/*
|--------------------------------------------------------------------------
| Validation
|--------------------------------------------------------------------------
*/

function isStage(
  value: unknown
): value is Stage {
  return (
    typeof value ===
      'string' &&

    (
      STAGES as
      readonly string[]
    ).includes(value)
  );
}


function isSafeHttpUrl(
  value: string
): boolean {
  try {
    const url =
      new URL(value);

    return (
      url.protocol ===
        'http:' ||

      url.protocol ===
        'https:'
    );
  } catch {
    return false;
  }
}


function normaliseNewApplication(
  input: NewApplication
): NewApplication {
  const company =
    input.company.trim();

  const role =
    input.role.trim();

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


  if (
    !isStage(input.stage)
  ) {
    throw new Error(
      'Application stage is invalid.'
    );
  }


  if (
    link &&
    (
      !isSafeHttpUrl(
        link
      ) ||

      link.length >
      MAX_LINK_LENGTH
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


  if (
    input.stage !==
      'wishlist' &&

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

    stage:
      input.stage,

    notes,
  };
}


/*
|--------------------------------------------------------------------------
| Current profile
|--------------------------------------------------------------------------
*/

async function getCurrentProfileId():
Promise<string> {
  const email =
    getCurrentEmail();


  if (!email) {
    throw new Error(
      'No email has been selected.'
    );
  }


  const profile =
    await findProfileByEmail(
      email
    );


  if (!profile) {
    throw new Error(
      'That profile no longer exists.'
    );
  }


  return profile.id;
}


/*
|--------------------------------------------------------------------------
| Fetch one application
|--------------------------------------------------------------------------
*/

async function fetchApplication(
  id: string,
  profileId: string
): Promise<Application> {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        'applications'
      )
      .select(
        `
        id,
        profile_id,
        company,
        role,
        link,
        date_sent,
        stage,
        notes,
        created_at
        `
      )
      .eq(
        'id',
        id
      )
      .eq(
        'profile_id',
        profileId
      )
      .maybeSingle();


  if (error) {
    console.error(
      'Unable to load application',
      error
    );

    throw new Error(
      'Unable to load that application.'
    );
  }


  if (!data) {
    throw new Error(
      'Application not found.'
    );
  }


  return mapApplication(
    data as ApplicationRow
  );
}


/*
|--------------------------------------------------------------------------
| Fetch applications
|--------------------------------------------------------------------------
*/

export async function fetchApplications():
Promise<Application[]> {
  const profileId =
    await getCurrentProfileId();


  const {
    data,
    error,
  } =
    await supabase
      .from(
        'applications'
      )
      .select(
        `
        id,
        profile_id,
        company,
        role,
        link,
        date_sent,
        stage,
        notes,
        created_at
        `
      )
      .eq(
        'profile_id',
        profileId
      )
      .order(
        'created_at',
        {
          ascending: false,
        }
      );


  if (error) {
    console.error(
      'Unable to load applications',
      error
    );

    throw new Error(
      'Unable to load applications.'
    );
  }


  return (
    data ?? []
  ).map(
    row =>
      mapApplication(
        row as ApplicationRow
      )
  );
}


/*
|--------------------------------------------------------------------------
| Create
|--------------------------------------------------------------------------
*/

export async function createApplication(
  input: NewApplication
): Promise<Application> {
  const cleanInput =
    normaliseNewApplication(
      input
    );


  const profileId =
    await getCurrentProfileId();


  const {
    data,
    error,
  } =
    await supabase
      .from(
        'applications'
      )
      .insert({
        profile_id:
          profileId,

        company:
          cleanInput.company,

        role:
          cleanInput.role,

        link:
          cleanInput.link ??
          null,

        date_sent:
          cleanInput.dateSent ||
          null,

        stage:
          cleanInput.stage,

        notes:
          cleanInput.notes ??
          null,
      })
      .select(
        `
        id,
        profile_id,
        company,
        role,
        link,
        date_sent,
        stage,
        notes,
        created_at
        `
      )
      .single();


  if (error) {
    console.error(
      'Unable to create application',
      error
    );

    throw new Error(
      'Unable to save the application.'
    );
  }


  return mapApplication(
    data as ApplicationRow
  );
}


/*
|--------------------------------------------------------------------------
| Update
|--------------------------------------------------------------------------
*/

export async function updateApplication(
  id: string,
  changes: Partial<Application>
): Promise<Application> {
  const profileId =
    await getCurrentProfileId();


  const current =
    await fetchApplication(
      id,
      profileId
    );


  const clean =
    normaliseNewApplication({
      company:
        changes.company ??
        current.company,

      role:
        changes.role ??
        current.role,

      link:
        changes.link !==
        undefined
          ? changes.link
          : current.link,

      dateSent:
        changes.dateSent ??
        current.dateSent,

      stage:
        changes.stage ??
        current.stage,

      notes:
        changes.notes !==
        undefined
          ? changes.notes
          : current.notes,
    });


  const {
    data,
    error,
  } =
    await supabase
      .from(
        'applications'
      )
      .update({
        company:
          clean.company,

        role:
          clean.role,

        link:
          clean.link ??
          null,

        date_sent:
          clean.dateSent ||
          null,

        stage:
          clean.stage,

        notes:
          clean.notes ??
          null,
      })
      .eq(
        'id',
        id
      )
      .eq(
        'profile_id',
        profileId
      )
      .select(
        `
        id,
        profile_id,
        company,
        role,
        link,
        date_sent,
        stage,
        notes,
        created_at
        `
      )
      .maybeSingle();


  if (error) {
    console.error(
      'Unable to update application',
      error
    );

    throw new Error(
      'Unable to update the application.'
    );
  }


  if (!data) {
    throw new Error(
      'Application not found.'
    );
  }


  return mapApplication(
    data as ApplicationRow
  );
}


/*
|--------------------------------------------------------------------------
| Delete
|--------------------------------------------------------------------------
*/

export async function deleteApplication(
  id: string
): Promise<void> {
  const profileId =
    await getCurrentProfileId();


  const {
    data,
    error,
  } =
    await supabase
      .from(
        'applications'
      )
      .delete()
      .eq(
        'id',
        id
      )
      .eq(
        'profile_id',
        profileId
      )
      .select(
        'id'
      );


  if (error) {
    console.error(
      'Unable to delete application',
      error
    );

    throw new Error(
      'Unable to delete the application.'
    );
  }


  if (
    !data ||
    data.length === 0
  ) {
    throw new Error(
      'Application not found.'
    );
  }
}