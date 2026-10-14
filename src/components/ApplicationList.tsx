import type { Application } from '../types';
import { ApplicationCard } from './ApplicationCard';

// ApplicationList basically takes the ApplicationCard instance and repeats it over a list of given Applications

export type ApplicationListProps = {
    applications: Application[]
}

export function ApplicationList({ applications }: ApplicationListProps){
    return (
        <div className="jobs">
            { applications.map(job => 
                    <ApplicationCard key={job.id} application={job}/>
                )
            }
        </div>
    )
}