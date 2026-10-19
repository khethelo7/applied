import {
  supabase,
} from '../lib/supabase';

import {
  normaliseEmail,
} from '../lib/identity';


export interface Profile {
  id: string;

  email: string;

  createdAt: string;
}


type ProfileRow = {
  id: string;

  email: string;

  created_at: string;
};


function mapProfile(
  row: ProfileRow
): Profile {
  return {
    id: row.id,

    email: row.email,

    createdAt:
      row.created_at,
  };
}


/// Find profile

export async function findProfileByEmail(
  email: string
): Promise<Profile | null> {
  const cleanEmail =
    normaliseEmail(email);

  const {
    data,
    error,
  } =
    await supabase
      .from('profiles')
      .select(
        'id, email, created_at'
      )
      .eq(
        'email',
        cleanEmail
      )
      .maybeSingle();

  if (error) {
    console.error(
      'Unable to find profile',
      error
    );

    throw new Error(
      'Unable to check that email right now.'
    );
  }

  if (!data) {
    return null;
  }

  return mapProfile(
    data as ProfileRow
  );
}


/// Create profile

export async function createProfile(
  email: string
): Promise<Profile> {
  const cleanEmail =
    normaliseEmail(email);

  /*
   * First check in case the user double-clicked,
   * refreshed, or another request already created it.
   */
  const existing =
    await findProfileByEmail(
      cleanEmail
    );

  if (existing) {
    return existing;
  }

  const {
    data,
    error,
  } =
    await supabase
      .from('profiles')
      .insert({
        email:
          cleanEmail,
      })
      .select(
        'id, email, created_at'
      )
      .single();

  if (error) {
    console.error(
      'Unable to create profile',
      error
    );

    throw new Error(
      'Unable to create your profile right now.'
    );
  }

  return mapProfile(
    data as ProfileRow
  );
}