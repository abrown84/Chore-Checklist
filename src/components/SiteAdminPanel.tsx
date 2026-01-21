import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { ShieldCheck } from '@phosphor-icons/react'

export const SiteAdminPanel: React.FC = () => {
  return (
    <Card className="bg-card/60 rounded-2xl border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Site Administration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Site admin features coming soon.
        </p>
      </CardContent>
    </Card>
  )
}

SiteAdminPanel.displayName = 'SiteAdminPanel'
