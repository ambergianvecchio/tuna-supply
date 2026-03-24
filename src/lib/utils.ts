export function calculateAge(birthday: Date): string {
  const now = new Date()
  let ageYears = now.getFullYear() - birthday.getFullYear()
  let ageMonths = now.getMonth() - birthday.getMonth()

  if (ageMonths < 0 || (ageMonths === 0 && now.getDate() < birthday.getDate())) {
    ageYears--
    ageMonths += 12
  }

  if (ageYears === 0) return `${ageMonths} month${ageMonths !== 1 ? 's' : ''} old`
  if (ageMonths === 0) return `${ageYears} year${ageYears !== 1 ? 's' : ''} old`
  return `${ageYears} yr${ageYears !== 1 ? 's' : ''}, ${ageMonths} mo old`
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
