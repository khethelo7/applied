import { useEffect,useState } from 'react';
import { Link,useNavigate,useParams } from 'react-router';
import { useApplications } from '../hooks/useApplications';
import { StageBadge } from '../components/StageBadge';
import { STAGES,type Stage } from '../types';
import { daysSince,needsNudge } from '../lib/applications';

export function ApplicationPage(){

    const {id} = useParams();
    const navigate = useNavigate();

    const {applications, loading, saving, error, update, remove} = useApplications();
    const job = applications.find( a => a.id === id );

    const [notes, setNotes] = useState('');
    const [confirm, setConfirm] = useState(false);

    useEffect( () => {
        if (job) setNotes(job.notes ?? '');
    }, [job?.id, job?.notes]);
    
    if (loading) return <p>Loading...</p>;
    
    if(!job) return <main><h1>We could not find that application</h1><Link to="/">Back to all applications</Link></main>;
    
    async function changeStage(stage: Stage){
        if (!id) return;
        try{
            await update(id, { stage });
        } catch{
            /* error is shown below */ 
        }
    }
    
    async function saveNotes(){
        if (!id) return;
        try{
            await update(id, { notes });
        }catch{
            /* error is shown below */ 
        }
    }
    
    async function deleteJob(){
        if (!id) return;
        try{
            await remove(id);
            navigate('/');
        } catch {
            /* error is shown below */ 
        }
    }
    
    return (
        <main>
            <Link to="/">Back to applications</Link>
            <h1>{job.company}</h1>
            <h2>{job.role}</h2>
            <StageBadge stage={job.stage}/>
            <p>
                {job.dateSent ? `Sent ${job.dateSent} · ${daysSince(job.dateSent)} days ago` : 'Not sent yet'}
            </p>
            
            { needsNudge(job) && <p className="nudge">Needs a nudge</p>}
            
            { job.link && <p>
                    <a href={job.link} target="_blank" rel="noopener noreferrer">View advert ↗</a>
                </p>
            }
            
            <div className="panel form">
                <label>
                    Stage
                    <select value={job.stage} disabled={saving} onChange={ e => void changeStage(e.target.value as Stage)}>
                        {STAGES.map( s => <option key={s} value={s}>{s === 'wishlist' ? 'Saved' : s}</option>)}
                    </select>
                </label>
                
                <label>
                    Notes
                    <textarea value={notes} onChange={ e => setNotes(e.target.value) } rows={5}/>
                </label>
                
                <button disabled={saving} onClick={ () => void saveNotes() }>Save notes</button>
                
                { error && <p role="alert">{error}</p> }
                <hr/>
                
                { confirm ? 
                    <div role="group" aria-label="Confirm deletion">
                        <p>Delete this application permanently?</p>
                        <button disabled={saving} onClick={ () => void deleteJob() }>Yes, delete</button>
                        <button onClick={ () => setConfirm(false) }>Cancel</button>
                    </div> : <button className="danger" onClick={ () => setConfirm(true) }>Delete this application</button>
                }
            </div>
        </main>
    )
}