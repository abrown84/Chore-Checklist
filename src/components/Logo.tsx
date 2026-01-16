import React from 'react'
import newLogo from '../assets/daily-bag-icon-transparent.png'

interface LogoProps {
  className?: string
}

export const Logo: React.FC<LogoProps> = ({ className = 'h-8 w-8 sm:h-10 sm:w-10' }) => {
  return <img src={newLogo} alt="Daily Bag logo" className={className} />
}










