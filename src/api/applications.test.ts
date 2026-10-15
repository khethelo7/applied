import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import type {
  Application,
} from '../types';

import {
  APPLICATIONS_STORAGE_KEY,
  createApplication,
  deleteApplication,
  fetchApplications,
  updateApplication,
} from './applications';

/*
 * Tiny fake localStorage implementation
 * for our automated tests.
 */
class MemoryStorage
  implements Storage {

  private data =
    new Map<string, string>();

  get length() {
    return this.data.size;
  }

  clear() {
    this.data.clear();
  }

  getItem(
    key: string
  ) {
    return (
      this.data.get(key) ??
      null
    );
  }

  key(
    index: number
  ) {
    return (
      [...this.data.keys()]
        [index] ??
      null
    );
  }

  removeItem(
    key: string
  ) {
    this.data.delete(key);
  }

  setItem(
    key: string,
    value: string
  ) {
    this.data.set(
      key,
      value
    );
  }
}

beforeEach(() => {
  vi.stubGlobal(
    'localStorage',
    new MemoryStorage()
  );

  /*
   * Predictable ID so tests don't depend
   * on random output.
   */
  vi.stubGlobal(
    'crypto',
    {
      randomUUID:
        () => 'new-id',
    }
  );
});

describe(
  'application storage',
  () => {

    it(
      'keeps every other application when one application is deleted',
      async () => {
        const before =
          await fetchApplications();

        const target =
          before[2];

        await deleteApplication(
          target.id
        );

        const after =
          await fetchApplications();

        expect(
          after
        ).toHaveLength(
          before.length - 1
        );

        expect(
          after.some(
            job =>
              job.id ===
              target.id
          )
        ).toBe(false);

        expect(
          after.map(
            job => job.id
          )
        ).toEqual(
          before
            .filter(
              job =>
                job.id !==
                target.id
            )
            .map(
              job => job.id
            )
        );
      }
    );

    /*
     * THIS is the regression test for
     * the exact bug you experienced.
     */
    it(
      'keeps existing applications after creating and then deleting a new one',
      async () => {
        const original =
          await fetchApplications();

        const created =
          await createApplication({
            company:
              'Example Co',

            role:
              'Junior Developer',

            link:
              undefined,

            dateSent:
              '2026-10-15',

            stage:
              'applied',

            notes:
              undefined,
          });

        await deleteApplication(
          created.id
        );

        expect(
          await fetchApplications()
        ).toEqual(
          original
        );
      }
    );

    it(
      'does not silently succeed when deleting an unknown ID',
      async () => {
        await expect(
          deleteApplication(
            'does-not-exist'
          )
        ).rejects.toThrow(
          'Application not found'
        );
      }
    );

    it(
      'rejects duplicate IDs already present in storage',
      async () => {
        const duplicate:
        Application = {
          id:
            'duplicate',

          company:
            'Example',

          role:
            'Developer',

          dateSent:
            '2026-10-15',

          stage:
            'applied',

          createdAt:
            '2026-10-15T10:00:00.000Z',
        };

        localStorage.setItem(
          APPLICATIONS_STORAGE_KEY,

          JSON.stringify([
            duplicate,
            duplicate,
          ])
        );

        await expect(
          fetchApplications()
        ).rejects.toThrow(
          'duplicate ID'
        );
      }
    );

    it(
      'protects id and createdAt during updates',
      async () => {
        const [job] =
          await fetchApplications();

        const updated =
          await updateApplication(
            job.id,
            {
              id:
                'changed-id',

              createdAt:
                '2000-01-01T00:00:00.000Z',

              notes:
                'Updated note',
            }
          );

        expect(
          updated.id
        ).toBe(
          job.id
        );

        expect(
          updated.createdAt
        ).toBe(
          job.createdAt
        );

        expect(
          updated.notes
        ).toBe(
          'Updated note'
        );
      }
    );

  }
);