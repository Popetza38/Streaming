import type { NormalizedDrama } from '../../utils/normalize'
import DramaCard from './DramaCard'

export default function DramaGrid({ dramas }: { dramas: NormalizedDrama[] }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {dramas.map(d => <DramaCard key={d.id} drama={d} />)}
    </div>
  )
}
