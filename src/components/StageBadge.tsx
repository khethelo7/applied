import type { Stage } from '../types';

// is the badge in the ApplicationCard that determines the status of the Application

type StageBadgeProps = {
    stage: Stage;
}
export function StageBadge({ stage }: StageBadgeProps){
    return (
        <span className={`badge stage-${stage}`}>{ stage === 'wishlist' ? 'Saved' : stage}</span>
    )
}