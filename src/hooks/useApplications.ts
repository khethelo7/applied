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
  ] =
    useState<Application[]>(
      []
    );


  const [
    loading,
    setLoading,
  ] =
    useState(true);


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


  const reload =
    useCallback(
      async () => {
        setLoading(true);

        setError('');


        try {
          const jobs =
            await api
              .fetchApplications();

          setApplications(
            jobs
          );
        } catch (e) {
          setError(
            e instanceof Error
              ? e.message
              : 'Unable to load applications'
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );


  useEffect(
    () => {
      void reload();
    },
    [
      reload,
    ]
  );


  async function write<T>(
    operation:
      () => Promise<T>
  ) {
    setSaving(true);

    setError('');


    try {
      const result =
        await operation();


      setApplications(
        await api
          .fetchApplications()
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


    add:
      (
        input:
          NewApplication
      ) =>
        write(
          () =>
            api
              .createApplication(
                input
              )
        ),


    update:
      (
        id:
          string,

        changes:
          Partial<Application>
      ) =>
        write(
          () =>
            api
              .updateApplication(
                id,
                changes
              )
        ),


    remove:
      (
        id:
          string
      ) =>
        write(
          () =>
            api
              .deleteApplication(
                id
              )
        ),
  };
}