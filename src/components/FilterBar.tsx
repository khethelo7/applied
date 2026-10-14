import { STAGES, type Stage } from '../types';

// filter component, searches through given search list state

type FilterBarProps = {
    search: string;
    setSearch: (value: string) => void;
    stage: Stage | 'all';
    setStage: (value: Stage | 'all' )=> void;
}

export function FilterBar({ search, setSearch, stage, setStage }: FilterBarProps){
    return (
        <div className="filters">
            <label>Search applications
                <input value={search} onChange={ e => setSearch(e.target.value)} placeholder="Company or job title"/>
            </label>
            <label>Filter by stage
                <select value={stage} onChange={e => setStage(e.target.value as Stage | 'all')}>
                    <option value="all">All stages</option>
                    { STAGES.map( s => <option value={s} key={s}>
                                        {s === 'wishlist' ? 'Saved': s}
                                       </option>
                                )
                    }
                </select>
            </label>
        </div>
    )
}