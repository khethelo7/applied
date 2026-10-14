import { STAGES, type Application, type Stage } from '../types';

export function daysSince( dateSent: string, today = new Date()): number {

  if (!dateSent) return 0;

  const [year, month, day] = dateSent.split('-').map(Number);
  const sent = Date.UTC(year,month-1,day);
  const current = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

  return Math.floor((current-sent) / 86400000);
}

export function needsNudge(job: Application, today = new Date()): boolean {
  return job.stage === 'applied' && Boolean(job.dateSent) && daysSince(job.dateSent,today) > 14;
}

export function countByStage(applications: Application[]): Record<Stage, number> {
  const counts = Object.fromEntries(STAGES.map( s => [s, 0])) as Record<Stage, number>;

  for (const job of applications) counts[job.stage]++;
  
  return counts;
}