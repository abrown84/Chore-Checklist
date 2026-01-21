import React from 'react'
import { GithubLogo, Envelope, Heart, ArrowSquareOut, Coffee, Star, Sparkle } from '@phosphor-icons/react'
import { Logo } from './Logo'

export const AboutPage: React.FC = () => {
  const APP_VERSION = '1.0.0'

  return (
    <div className="space-y-6">
      {/* App Info Card */}
      <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border shadow-lg p-6">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary text-foreground shadow-inner mb-4">
            <Logo className="h-14 w-14" />
          </div>
          <h1 className="text-2xl font-brand font-bold tracking-tight text-foreground">
            DAILY BAG
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your daily productivity hub
          </p>
          <span className="text-xs text-muted-foreground/60 mt-2 px-3 py-1 rounded-full bg-secondary/50">
            Version {APP_VERSION}
          </span>
        </div>

        <p className="text-muted-foreground text-center max-w-md mx-auto">
          Daily Bag helps families and households track chores, earn points,
          and stay motivated with gamification and friendly competition.
        </p>
      </div>

      {/* Developer Card */}
      <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border shadow-lg p-6">
        <h2 className="text-lg font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          Made With Love By
        </h2>

        <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-chart-4 flex items-center justify-center text-white font-bold text-lg">
            AB
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Alex Brown</h3>
            <p className="text-sm text-muted-foreground">Full Stack Developer</p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <a
            href="https://github.com/abrown84"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl bg-secondary/20 hover:bg-secondary/40 transition-colors group"
          >
            <GithubLogo className="w-5 h-5 text-foreground" />
            <span className="text-foreground font-medium">@abrown84</span>
            <ArrowSquareOut className="w-4 h-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>

          <a
            href="mailto:konfliktquake@gmail.com"
            className="flex items-center gap-3 p-3 rounded-xl bg-secondary/20 hover:bg-secondary/40 transition-colors group"
          >
            <Envelope className="w-5 h-5 text-primary" />
            <span className="text-foreground font-medium">konfliktquake@gmail.com</span>
            <ArrowSquareOut className="w-4 h-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        </div>
      </div>

      {/* Features Card */}
      <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border shadow-lg p-6">
        <h2 className="text-lg font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
          <Sparkle className="w-5 h-5 text-yellow-500" />
          Features
        </h2>

        <div className="grid gap-3">
          {[
            { icon: '📋', label: 'Track daily chores and tasks' },
            { icon: '🏆', label: 'Earn points and level up' },
            { icon: '👥', label: 'Compete with family members' },
            { icon: '🎨', label: 'Customize your profile' },
            { icon: '💰', label: 'Redeem points for rewards' },
            { icon: '📱', label: 'Works offline as a PWA' },
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-3 p-2">
              <span className="text-xl">{feature.icon}</span>
              <span className="text-muted-foreground">{feature.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack Card */}
      <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border shadow-lg p-6">
        <h2 className="text-lg font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
          <Coffee className="w-5 h-5 text-amber-600" />
          Built With
        </h2>

        <div className="flex flex-wrap gap-2">
          {[
            'React', 'TypeScript', 'Tailwind CSS', 'Convex',
            'Vite', 'PWA', 'Framer Motion', 'shadcn/ui'
          ].map((tech) => (
            <span
              key={tech}
              className="px-3 py-1.5 rounded-full bg-secondary/50 text-sm text-muted-foreground border border-border/50"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Source Code Card */}
      <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border shadow-lg p-6">
        <h2 className="text-lg font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          Open Source
        </h2>

        <p className="text-muted-foreground mb-4">
          This project is open source! Feel free to check out the code,
          report issues, or contribute.
        </p>

        <a
          href="https://github.com/abrown84/Chore-Checklist"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors"
        >
          <GithubLogo className="w-5 h-5" />
          View on GitHub
          <ArrowSquareOut className="w-4 h-4" />
        </a>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground/60 py-4">
        <p>Made with <Heart className="w-4 h-4 inline text-red-500 mx-1" /> in 2024</p>
      </div>
    </div>
  )
}
