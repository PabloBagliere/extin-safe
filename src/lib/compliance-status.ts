export type ComplianceStatus = 'in_rule' | 'due_soon' | 'overdue_or_attention'

export function complianceStatus(
  operationalStatus: 'active' | 'attention_required' | 'out_of_service',
  nextControlDueOn: string | null,
  today = argentinaToday(),
): ComplianceStatus {
  if (
    operationalStatus !== 'active' ||
    !nextControlDueOn ||
    nextControlDueOn < today
  ) {
    return 'overdue_or_attention'
  }

  const alertLimit = addDays(today, 30)
  return nextControlDueOn <= alertLimit ? 'due_soon' : 'in_rule'
}

export function argentinaToday() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(new Date())
}

function addDays(date: string, days: number) {
  const value = new Date(`${date}T12:00:00Z`)
  value.setUTCDate(value.getUTCDate() + days)
  return value.toISOString().slice(0, 10)
}
