export type Stage = 'wishlist' | 'applied' | 'interview' | 'offer' | 'closed';

export const STAGES: Stage[] = ['wishlist', 'applied', 'interview', 'offer', 'closed'];


export interface Application {
    id: string;
    company: string;
    role: string;
    link?: string;
    dateSent: string;
    stage: Stage;
    notes?: string;
    createdAt: string;
}


export type NewApplication = Omit<Application, 'id' | 'createdAt' >;