/**
 * Season utilities for tracking seasonal progress
 */

export type SeasonName = 'Spring' | 'Summer' | 'Fall' | 'Winter'

export interface Season {
  name: SeasonName
  startDate: Date
  endDate: Date
  year: number
  quarter: number // 1-4 (Q1=Jan-Mar, Q2=Apr-Jun, Q3=Jul-Sep, Q4=Oct-Dec)
}

/**
 * Get the current season based on date
 */
export const getCurrentSeason = (date: Date = new Date()): Season => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1 // getMonth() returns 0-11
  const day = date.getDate()
  
  // Define season boundaries (Northern Hemisphere)
  // Spring: March 20 - June 20
  // Summer: June 21 - September 21
  // Fall: September 22 - December 20
  // Winter: December 21 - March 19
  
  let season: SeasonName
  let startDate: Date
  let endDate: Date
  let quarter: number
  
  if ((month === 3 && day >= 20) || month === 4 || month === 5 || (month === 6 && day < 21)) {
    // Spring (Q2)
    season = 'Spring'
    quarter = 2
    startDate = new Date(year, 2, 20) // March 20
    endDate = new Date(year, 5, 20) // June 20
  } else if ((month === 6 && day >= 21) || month === 7 || month === 8 || (month === 9 && day < 22)) {
    // Summer (Q3)
    season = 'Summer'
    quarter = 3
    startDate = new Date(year, 5, 21) // June 21
    endDate = new Date(year, 8, 21) // September 21
  } else if ((month === 9 && day >= 22) || month === 10 || month === 11 || (month === 12 && day < 21)) {
    // Fall (Q4)
    season = 'Fall'
    quarter = 4
    startDate = new Date(year, 8, 22) // September 22
    endDate = new Date(year, 11, 20) // December 20
  } else {
    // Winter (Q1 of next year)
    season = 'Winter'
    quarter = 1
    if (month === 12 && day >= 21) {
      // Late December - Winter starts this year
      startDate = new Date(year, 11, 21) // December 21
      endDate = new Date(year + 1, 2, 19) // March 19 next year
    } else {
      // Early months - Winter started last year
      startDate = new Date(year - 1, 11, 21) // December 21 last year
      endDate = new Date(year, 2, 19) // March 19 this year
    }
  }
  
  return {
    name: season,
    startDate,
    endDate,
    year: startDate.getFullYear(),
    quarter
  }
}

/**
 * Get season identifier string (e.g., "Spring 2024")
 */
export const getSeasonId = (season: Season): string => {
  return `${season.name} ${season.year}`
}

/**
 * Get season identifier for current season
 */
export const getCurrentSeasonId = (): string => {
  return getSeasonId(getCurrentSeason())
}

/**
 * Check if a date is within a season
 */
export const isDateInSeason = (date: Date, season: Season): boolean => {
  return date >= season.startDate && date <= season.endDate
}

/**
 * Get season icon
 */
export const getSeasonIcon = (season: SeasonName): string => {
  switch (season) {
    case 'Spring':
      return '🌸'
    case 'Summer':
      return '☀️'
    case 'Fall':
      return '🍂'
    case 'Winter':
      return '❄️'
  }
}

/**
 * Get season color class
 */
export const getSeasonColor = (season: SeasonName): string => {
  switch (season) {
    case 'Spring':
      return 'text-green-500'
    case 'Summer':
      return 'text-yellow-500'
    case 'Fall':
      return 'text-orange-500'
    case 'Winter':
      return 'text-blue-500'
  }
}

/**
 * Get days remaining in current season
 */
export const getDaysRemainingInSeason = (season: Season): number => {
  const now = new Date()
  const end = new Date(season.endDate)
  const diff = end.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}


