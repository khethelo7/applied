import type { Application,NewApplication } from '../types';
import { seed } from '../data/seed';

const KEY = 'applied-applications-v1';
const delay = () => new Promise<void>( resolve => setTimeout(resolve, 300));

function read(): Application[] {
    // our helper function to read from the seeded data
    const raw = localStorage.getItem(KEY);

    if (raw === null){
        localStorage.setItem(KEY, JSON.stringify(seed));
        return [...seed];
    }

    const parsed: unknown = JSON.parse(raw); // 'unkown' means will be whatever type is returned from JSON.parse()

    if (!Array.isArray(parsed)) throw new Error('Saved applications are not a list.');

    return parsed as Application[];
}

function write(jobs: Application[]){
    // our writer function that basically writes to the file on "add Applied for job"
    localStorage.setItem(KEY,JSON.stringify(jobs));
}

export async function fetchApplications():Promise<Application[]>{
    await delay();
    return read();
}

export async function createApplication(input:NewApplication):Promise<Application>{
    await delay();
    const job = {...input,id:crypto.randomUUID(),createdAt:new Date().toISOString()};
    write([job,...read()]);
    return job;
}

export async function updateApplication(id:string,changes:Partial<Application>):Promise<Application>{
    // our writer funtion that writes to an already existing application
    await delay();

    const jobs = read();
    const index = jobs.findIndex(j=>j.id===id);

    if (index < 0) throw new Error('Application not found'); // if the application you try to edit doesn't exist

    const { id:_id, createdAt:_createdAt ,...safeChanges } = changes;

    void _id;
    void _createdAt;
    jobs [index] = { ...jobs[index], ...safeChanges };
    write(jobs);
    return jobs[index];
}

export async function deleteApplication(id:string):Promise<void>{
    // writer function (or a helper??) that finds the application you're trying to delete and removes it
    await delay();
    write(read().filter( j => j.id! == id)); // it then writes to the seeded data
}