import { useState } from 'react';
import { Link } from 'react-router';
import { useApplications } from '../hooks/useApplications';
import { ApplicationList } from '../components/ApplicationList';
import { StageSummary } from '../components/StageSummary';
import { FilterBar } from '../components/FilterBar';
import type { Stage } from '../types';


export function ApplicationsPage(){
    const {applications, loading, error, reload} = useApplications();
    const [search, setSearch] = useState('');
    const [stage, setStage ] = useState<Stage|'all'>('all');
    const filtered = 
        applications.filter( j => (stage === 'all' || j.stage === stage) && `${j.company} ${j.role}`.toLowerCase().includes(search.toLowerCase()))
            .sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
        
        if (loading) return <p role="status">Loading applications...</p>;
        
        if (error) return <div role="alert">{error} <button onClick={ () => void reload() }>Try again</button></div>;
        
        return (
            <main>
                <h1>Your applications</h1>
                
                <StageSummary applications={applications}/>
                {applications.length === 0 ? 
                    <div className="panel">
                        <p>No applications yet.</p>
                        <Link to="/new">Add your first application</Link>
                    </div> : 
                    <>
                        <FilterBar search={search} setSearch={setSearch} stage={stage} setStage={setStage}/>
                        
                        {filtered.length ? 
                            <ApplicationList applications={filtered}/> : 
                                <div className="panel">
                                    <p>No jobs match your filters.</p>
                                    <button onClick={ () => { setSearch(''); setStage('all') ;}}>Clear filters</button>
                                </div>
                        }
                    </>
                }
            </main>
        )
}