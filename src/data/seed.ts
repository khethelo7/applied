import type { Application, Stage } from '../types';

// our seeded data...
// chose Array over Dictionary to understand more about nested Arrays
// basically like Dictionaries except more complex and risky coz they can carry inconsistent data

const examples: [string, string, Stage, string][] = [
    ['Vodacom','Junior Developer','applied','2026-09-10'],
    ['Takealot','Frontend Intern','interview','2026-10-02'],
    ['Discovery','Graduate Engineer','wishlist',''],
    ['MTN','Web Developer','applied','2026-09-12'],
    ['Standard Bank','IT Intern','offer','2026-09-20'],
    ['Shoprite','Junior Analyst','closed','2026-08-19'],
    ['Nedbank','Graduate Developer','applied','2026-10-08'],
];

export const seed: Application[] = examples.map( // at the end, converted it to a dictionary, then made it into an Array of Application type
    ( [ company, role, stage, dateSent ], i) => (
        { id:`demo-${i+1}`, company, role, stage, dateSent, createdAt: new Date(Date.UTC(2026,9,10-i)).toISOString() }
    )
);