import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { ChevronRight, Palmtree, Bell, LogOut, RefreshCw } from 'lucide-react'
import { useSession } from '../contexts/SessionContext'
import { useNotifications } from '../hooks/useNotifications'
import { useFlatmateActivity } from '../hooks/useFlatmateActivity'
import { useFlatmates } from '../hooks/useFlatmates'
import { formatTimeAgo } from '../lib/utils'
import PageHeader from '../components/layout/PageHeader'
import FlatmateSwitcher from '../components/ui/FlatmateSwitcher'
import Avatar from '../components/ui/Avatar'
import ListCell from '../components/ui/ListCell'

export default function MeScreen() {
  const navigate = useNavigate()
  const { flatmate: sessionFlatmate, logout, switchProfile } = useSession()
  const { data: flatmates } = useFlatmates()
  const [activeFlatmate, setActiveFlatmate] = useState(() => sessionFlatmate)

  const { isSubscribed, isLoading: notifLoading, subscribe, unsubscribe } = useNotifications()
  const { data: activity } = useFlatmateActivity(activeFlatmate?.id, 10)

  const memberSince = activeFlatmate?.created_at
    ? format(parseISO(activeFlatmate.created_at), 'MMMM yyyy')
    : ''

  function handleNotifToggle() {
    if (isSubscribed) unsubscribe()
    else subscribe()
  }

  return (
    <div>
      <PageHeader title="Me" />

      <div className="px-4 mb-4">
        <FlatmateSwitcher
          activeFlatmateId={activeFlatmate?.id}
          onSwitch={f => setActiveFlatmate(flatmates?.find(fm => fm.id === f.id) ?? f)}
        />
      </div>

      <div className="mx-4 bg-white rounded-ios p-5 mb-3 flex items-center gap-4">
        <Avatar flatmate={activeFlatmate} size="lg" />
        <div>
          <p className="text-[22px] font-bold text-black">{activeFlatmate?.name}</p>
          {memberSince && (
            <p className="text-[13px] text-[rgba(60,60,67,0.5)] mt-0.5">Member since {memberSince}</p>
          )}
        </div>
      </div>

      <section className="mx-4 mb-3">
        <p className="text-[13px] font-semibold uppercase tracking-wide text-[rgba(60,60,67,0.5)] mb-2 px-1">
          Recent activity
        </p>
        <div className="bg-white rounded-ios overflow-hidden">
          {!activity || activity.length === 0 ? (
            <p className="px-4 py-5 text-[15px] text-[rgba(60,60,67,0.4)] text-center">Nothing logged yet</p>
          ) : (
            activity.map(item => (
              <div
                key={item.id}
                className="flex items-center gap-3 px-4 py-3 border-b border-[rgba(60,60,67,0.08)] last:border-0"
              >
                <span className="text-xl w-7 text-center flex-shrink-0">
                  {item._type === 'chore' ? item.chore?.icon : item.supply?.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] text-black truncate">
                    {item._type === 'chore'
                      ? item.chore?.name
                      : `Bought ${item.supply?.name}`}
                  </p>
                  <p className="text-[13px] text-[rgba(60,60,67,0.5)]">{formatTimeAgo(item.done_at ?? item.logged_at)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="mx-4 mb-3">
        <div className="bg-white rounded-ios overflow-hidden">
          <ListCell
            right={<ChevronRight size={16} className="text-[rgba(60,60,67,0.3)]" />}
            onClick={() => navigate('/me/vacation')}
            left={<Palmtree size={18} className="text-[rgba(60,60,67,0.5)]" />}
          >
            <span className="text-[17px] text-black">Vacation Mode</span>
          </ListCell>

          <ListCell
            separator={false}
            left={<Bell size={18} className="text-[rgba(60,60,67,0.5)]" />}
            right={
              <button
                onClick={handleNotifToggle}
                disabled={notifLoading}
                className={`w-12 h-7 rounded-full transition-colors flex items-center px-0.5 ${
                  isSubscribed ? 'bg-green-primary justify-end' : 'bg-[rgba(116,116,128,0.3)] justify-start'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-white shadow-sm" />
              </button>
            }
          >
            <span className="text-[17px] text-black">Notifications</span>
          </ListCell>
        </div>
      </section>

      <section className="mx-4 mb-6">
        <div className="bg-white rounded-ios overflow-hidden">
          <ListCell
            left={<RefreshCw size={18} className="text-ios-blue" />}
            onClick={switchProfile}
          >
            <span className="text-[17px] text-ios-blue">Switch profile</span>
          </ListCell>

          <ListCell
            separator={false}
            left={<LogOut size={18} className="text-ios-red" />}
            onClick={logout}
          >
            <span className="text-[17px] text-ios-red">Log out of this device</span>
          </ListCell>
        </div>
      </section>
    </div>
  )
}
