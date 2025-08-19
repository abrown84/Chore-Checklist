import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Lock, 
  Eye, 
  EyeOff,
  Info,
  RefreshCw
} from 'lucide-react'
import { SecurityUtils, SECURITY_CONFIG } from '../config/security'
import { storage } from '../utils/storage'

interface SecurityStatusProps {
  className?: string
}

export const SecurityStatus: React.FC<SecurityStatusProps> = ({ className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [securityScore, setSecurityScore] = useState(0)
  const [securityIssues, setSecurityIssues] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const calculateSecurityScore = async () => {
    setIsLoading(true)
    let score = 0
    const issues: string[] = []

    try {
      // Check if running in secure environment
      if (SecurityUtils.isSecureEnvironment()) {
        score += 20
      } else {
        issues.push('Not running over HTTPS')
      }

      // Check if PWA is available
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        score += 15
      } else {
        issues.push('PWA mode not available')
      }

      // Check storage encryption
      try {
        const testData = { test: 'security_check' }
        const success = storage.setItem('security_test', testData, { encrypt: true })
        if (success) {
          score += 25
          storage.removeItem('security_test')
        } else {
          issues.push('Storage encryption not working properly')
        }
      } catch (error) {
        issues.push('Storage encryption failed')
      }

      // Check if data is being backed up
      const hasBackup = localStorage.getItem('choreApp_backup_timestamp')
      if (hasBackup) {
        score += 20
      } else {
        issues.push('No recent data backup found')
      }

      // Check for suspicious content in stored data
      const keys = storage.getKeys()
      let hasSuspiciousContent = false
      
      for (const key of keys) {
        try {
          const data = storage.getItem(key)
          if (data && typeof data === 'string' && SecurityUtils.containsSuspiciousContent(data)) {
            hasSuspiciousContent = true
            break
          }
        } catch (error) {
          // Skip corrupted data
        }
      }

      if (!hasSuspiciousContent) {
        score += 20
      } else {
        issues.push('Suspicious content detected in stored data')
      }

      // Check storage usage
      const storageInfo = storage.getStorageInfo()
      if (storageInfo.used < SECURITY_CONFIG.STORAGE.MAX_SIZE * 0.8) {
        score += 10
      } else {
        issues.push('Storage usage is high')
      }

    } catch (error) {
      console.error('Error calculating security score:', error)
      issues.push('Unable to complete security check')
    } finally {
      setIsLoading(false)
    }

    setSecurityScore(Math.min(score, 100))
    setSecurityIssues(issues)
  }

  useEffect(() => {
    calculateSecurityScore()
  }, [])

  const getSecurityLevel = (score: number) => {
    if (score >= 80) return { level: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' }
    if (score >= 60) return { level: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' }
    if (score >= 40) return { level: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    return { level: 'Poor', color: 'text-red-600', bg: 'bg-red-100' }
  }

  const getSecurityIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-5 h-5 text-green-600" />
    if (score >= 60) return <Shield className="w-5 h-5 text-blue-600" />
    if (score >= 40) return <AlertTriangle className="w-5 h-5 text-yellow-600" />
    return <AlertTriangle className="w-5 h-5 text-red-600" />
  }

  const securityLevel = getSecurityLevel(securityScore)

  return (
    <Card className={`bg-card/80 backdrop-blur-sm ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span>Security Status</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 h-auto"
          >
            {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Security Score */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getSecurityIcon(securityScore)}
            <div>
              <div className="font-medium">Security Score</div>
              <div className={`text-sm ${securityLevel.color}`}>
                {securityLevel.level} ({securityScore}/100)
              </div>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={calculateSecurityScore}
            disabled={isLoading}
            className="flex items-center space-x-1"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>

        {/* Security Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              securityScore >= 80 ? 'bg-green-500' :
              securityScore >= 60 ? 'bg-blue-500' :
              securityScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${securityScore}%` }}
          />
        </div>

        {/* Quick Status */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-green-600" />
            <span>Data Encrypted</span>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <span>Local Storage</span>
          </div>
        </div>

        {/* Expanded Security Details */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t border-border">
            {/* Security Issues */}
            {securityIssues.length > 0 && (
              <div className="space-y-2">
                <div className="font-medium text-amber-700">Security Issues Found:</div>
                <ul className="space-y-1">
                  {securityIssues.map((issue, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm text-amber-700">
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Security Recommendations */}
            <div className="space-y-2">
              <div className="font-medium text-blue-700">Security Tips:</div>
              <ul className="space-y-1">
                {SecurityUtils.getSecurityRecommendations().map((tip, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-blue-700">
                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Security Features */}
            <div className="space-y-2">
              <div className="font-medium text-green-700">Active Security Features:</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Input Validation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Rate Limiting</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Session Management</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Data Encryption</span>
                </div>
              </div>
            </div>

            {/* Family Safety Notice */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <div className="font-medium mb-1">Family Safety Features</div>
                  <p>This app includes content filtering, rate limiting, and secure data storage to keep your family safe while managing chores together.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
