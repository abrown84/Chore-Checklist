import React from 'react'
import { motion } from 'framer-motion'

interface PageWrapperProps {
  children: React.ReactNode
  className?: string
  title?: string
  description?: string
  showBackground?: boolean
}

export const PageWrapper: React.FC<PageWrapperProps> = ({
  children,
  className = '',
  title,
  description,
  showBackground = true
}) => {
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className={`min-h-full ${className}`}>
      {/* Optional Background Gradient */}
      {showBackground && (
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_0%,rgba(14,165,233,0.18),transparent_60%),radial-gradient(40%_30%_at_80%_20%,rgba(139,92,246,0.14),transparent_60%),radial-gradient(30%_30%_at_20%_60%,rgba(234,179,8,0.12),transparent_60%)] dark:bg-[radial-gradient(60%_40%_at_50%_0%,rgba(14,165,233,0.18),transparent_60%),radial-gradient(40%_30%_at_80%_20%,rgba(139,92,246,0.14),transparent_60%),radial-gradient(30%_30%_at_20%_60%,rgba(234,179,8,0.12),transparent_60%)]" />
        </div>
      )}

      {/* Page Content */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={fadeUp}
        className="relative z-10"
      >
        {/* Optional Page Header */}
        {(title || description) && (
          <div className="mb-6 sm:mb-8">
            {title && (
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-foreground mb-2">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-muted-foreground font-body text-base sm:text-lg max-w-3xl">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Page Content */}
        {children}
      </motion.div>
    </div>
  )
}
