import { STAGES, type Application } from '../types';
import { countByStage } from '../lib/applications';
import { type ApplicationListProps } from './ApplicationList';

export function StageSummary({ applications }: ApplicationListProps){

    const counts = countByStage(applications);

    return (
        <div className="summary">
            { STAGES.map(stage => <div className="panel" key={stage}>
                                        <strong>{counts[stage]}</strong>
                                        <span>
                                            {stage === 'wishlist' ? 'Saved' : stage}
                                        </span>
                                    </div>)}
        </div>
    )
}