import { Link } from 'react-router';
import type { Application } from '../types';
import { daysSince,needsNudge } from '../lib/applications';
import { StageBadge } from './StageBadge';

// this is our ApplicationCard component, controls each iteration of an Application instance

type ApplicationCardProps = {
    application: Application;
}

export function ApplicationCard({ application: job }: ApplicationCardProps){
    return (
        <article className="panel job">
            <Link to={`/applications/${job.id}`}>
                <strong>{job.company}</strong> · {job.role}
            </Link>
            <StageBadge stage={job.stage}/>
            <p>{job.dateSent?`Sent ${job.dateSent} · ${daysSince(job.dateSent)} days ago`:'Not sent yet'}</p>
            
            { needsNudge(job) && <p className="nudge">Needs a nudge</p> }

        </article>
    );
}