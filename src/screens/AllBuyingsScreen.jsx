import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSupplies } from '../hooks/useSupplies'
import PageHeader from '../components/layout/PageHeader'
import SearchBar from '../components/ui/SearchBar'
import SupplyCard from '../components/supplies/SupplyCard'
import EmptyState from '../components/ui/EmptyState'

const STATUS_ORDER = ['out', 'running_low', 'stocked']
const SECTION_TITLES = {
  out:         '🔴 Out',
  running_low: '🟡 Running Low',
  stocked:     '🟢 Stocked',
}
const SECTION_TITLE_COLORS = {
  out:         'text-ios-red',
  running_low: 'text-ios-amber',
  stocked:     'text-green-dark',
}

export default function AllBuyingsScreen() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const { data: supplies } = useSupplies()

  const filtered = useMemo(() => {
    if (!search) return supplies ?? []
    const q = search.toLowerCase()
    return (supplies ?? []).filter(s => s.name.toLowerCase().includes(q))
  }, [supplies, search])

  const sections = useMemo(() => {
    const groups = { out: [], running_low: [], stocked: [] }
    filtered.forEach(s => {
      const key = groups[s.status] ? s.status : 'stocked'
      groups[key].push(s)
    })
    return STATUS_ORDER
      .map(status => ({ status, items: groups[status] }))
      .filter(({ items }) => items.length > 0)
  }, [filtered])

  return (
    <div>
      <PageHeader title="Supplies" />
      <div className="sticky top-0 z-10 bg-ios-bg px-4 py-2">
        <SearchBar value={search} onChange={setSearch} placeholder="Search supplies…" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="🛒" heading="No supplies found" body="Try a different search" />
      ) : (
        sections.map(({ status, items }) => (
          <section key={status} className="mb-4">
            <p className={`text-[13px] font-semibold uppercase tracking-wide px-4 mb-2 ${SECTION_TITLE_COLORS[status]}`}>
              {SECTION_TITLES[status]}
            </p>
            <div className="mx-4 bg-white rounded-ios overflow-hidden">
              {items.map(supply => (
                <SupplyCard
                  key={supply.id}
                  supply={supply}
                  onClick={() => navigate(`/buyings/${supply.id}`)}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  )
}
