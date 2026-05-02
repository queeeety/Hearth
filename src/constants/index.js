// Session
export const SESSION_STORAGE_KEY = 'hearth_session'
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000
export const ASSIGNMENTS_STORAGE_KEY_PREFIX = 'hearth_assignments_'

// React Query keys
export const QUERY_KEYS = {
  FLATMATES:        'flatmates',
  CHORES:           'chores',
  ASSIGNMENTS:      'assignments',
  CHORE_LOGS:       'chore_logs',
  SUPPLIES:         'supplies',
  SUPPLY_LOGS:      'supply_logs',
  NEXT_BUYER:       'next_buyer',
  VACATION_PERIODS: 'vacation_periods',
}

// Supply statuses
export const SUPPLY_STATUS = {
  STOCKED:     'stocked',
  RUNNING_LOW: 'running_low',
  OUT:         'out',
}

// Route paths
export const ROUTES = {
  HOME:         '/',
  CHORES:       '/chores',
  CHORE:        '/chores/:id',
  BUYINGS:      '/buyings',
  BUYING:       '/buyings/:id',
  MY_WORK:      '/my-work',
  ME:           '/me',
  VACATION:     '/me/vacation',
}
