import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import * as api
  from '../api/applications';

import type {
  Application,
  NewApplication,
} from '../types';

export function useApplications() {
  const [
    applications,
    setApplications,
  ] = useState<Application[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState('');

  /*
   * Refresh React's copy of the data from localStorage.
   */
  const reload =
    useCallback(async () => {
      setLoading(true);
      setError('');

      try {
        const jobs =
          await api.fetchApplications();

        setApplications(jobs);
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : 'Unable to load applications'
        );
      } finally {
        setLoading(false);
      }
    }, []);

  /*
   * Initial application load.
   */
  useEffect(() => {
    void reload();
  }, [reload]);

  /*
   * Synchronise multiple browser tabs.
   *
   * Example:
   *
   * Tab A deletes an application.
   * Tab B automatically reloads its application list.
   */
  useEffect(() => {
    function onStorage(
      event: StorageEvent
    ) {
      if (
        event.key ===
        api.APPLICATIONS_STORAGE_KEY
      ) {
        void reload();
      }
    }

    window.addEventListener(
      'storage',
      onStorage
    );

    return () =>
      window.removeEventListener(
        'storage',
        onStorage
      );
  }, [reload]);

  /*
   * Shared wrapper for every operation that modifies storage.
   */
  async function write<T>(
    operation: () => Promise<T>
  ) {
    setSaving(true);
    setError('');

    try {
      const result =
        await operation();

      /*
       * Re-read the real persisted data rather than
       * assuming our React state matches localStorage.
       */
      setApplications(
        await api.fetchApplications()
      );

      return result;
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Unable to save'
      );

      throw e;
    } finally {
      setSaving(false);
    }
  }

  return {
    applications,
    loading,
    saving,
    error,
    reload,

    add: (
      input: NewApplication
    ) =>
      write(() =>
        api.createApplication(input)
      ),

    update: (
      id: string,
      changes: Partial<Application>
    ) =>
      write(() =>
        api.updateApplication(
          id,
          changes
        )
      ),

    remove: (
      id: string
    ) =>
      write(() =>
        api.deleteApplication(id)
      ),
  };
}