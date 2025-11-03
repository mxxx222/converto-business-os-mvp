'use client'

import { useEffect, useState } from 'react'
import { useABTesting } from '@/lib/ab-testing'

interface DashboardProps {
  isVisible?: boolean
}

export default function ABTestDashboard({ isVisible = false }: DashboardProps) {
  const { getTestResults } = useABTesting()
  const [results, setResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadResults = () => {
      try {
        const testResults = getTestResults()
        setResults(testResults)
      } catch (error) {
        console.error('Failed to load A/B test results:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadResults()
    const interval = setInterval(loadResults, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [getTestResults])

  if (!isVisible) {
    return null
  }

  if (isLoading) {
    return (
      <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg shadow-lg z-50">
        <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full mx-auto"></div>
        <p className="text-sm mt-2">Loading A/B test results...</p>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg z-50">
        <p className="text-sm">Failed to load test results</p>
      </div>
    )
  }

  const getRecommendationColor = (recommendation: string) => {
    if (recommendation.includes('Deploy B')) return 'text-green-600'
    if (recommendation.includes('No significant')) return 'text-red-600'
    return 'text-yellow-600'
  }

  const getImprovementColor = (improvement: number) => {
    if (improvement > 20) return 'text-green-600'
    if (improvement > 0) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-xl p-6 max-w-md z-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">A/B Test Results</h3>
        <div className="text-xs text-gray-500">
          Day {results.testDuration}
        </div>
      </div>

      {/* Test Status */}
      <div className="mb-4">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
          results.testComplete ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {results.testComplete ? '✅ Test Complete' : '⏳ Testing in Progress'}
        </div>
      </div>

      {/* Variant Comparison */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-xs font-medium text-gray-600 mb-1">Variant A (Control)</div>
          <div className="text-lg font-bold text-gray-900">{results.variantA.conversionRate.toFixed(1)}%</div>
          <div className="text-xs text-gray-500">{results.variantA.pageViews} visitors</div>
          <div className="text-xs text-gray-500">{results.variantA.conversions} conversions</div>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-xs font-medium text-blue-600 mb-1">Variant B (Optimized)</div>
          <div className="text-lg font-bold text-blue-600">{results.variantB.conversionRate.toFixed(1)}%</div>
          <div className="text-xs text-gray-500">{results.variantB.pageViews} visitors</div>
          <div className="text-xs text-gray-500">{results.variantB.conversions} conversions</div>
        </div>
      </div>

      {/* Improvement */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-xs font-medium text-gray-600 mb-1">Improvement</div>
        <div className={`text-2xl font-bold ${getImprovementColor(results.improvement.absolute)}`}>
          {results.improvement.absolute > 0 ? '+' : ''}{results.improvement.absolute.toFixed(1)}%
        </div>
        <div className="text-xs text-gray-500">
          {results.improvement.relative > 0 ? '+' : ''}{results.improvement.relative.toFixed(1)}% relative
        </div>
      </div>

      {/* Statistical Significance */}
      <div className="mb-4">
        <div className="text-xs font-medium text-gray-600 mb-2">Statistical Significance</div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            results.statisticalSignificance.isSignificant ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className="text-sm font-medium">
            {results.statisticalSignificance.isSignificant ? 'Significant' : 'Not Significant'}
          </span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          p-value: {results.statisticalSignificance.pValue.toFixed(3)} (95% confidence)
        </div>
      </div>

      {/* Recommendation */}
      <div className="mb-4 p-3 border rounded-lg">
        <div className="text-xs font-medium text-gray-600 mb-1">Recommendation</div>
        <div className={`text-sm font-bold ${getRecommendationColor(results.recommendation)}`}>
          {results.recommendation}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            const data = {
              results,
              timestamp: new Date().toISOString(),
              exportFormat: 'csv'
            }

            const csv = `Variant,Page Views,Conversions,Conversion Rate,Bounce Rate
A,${results.variantA.pageViews},${results.variantA.conversions},${results.variantA.conversionRate}%,${results.variantA.bounceRate}%
B,${results.variantB.pageViews},${results.variantB.conversions},${results.variantB.conversionRate}%,${results.variantB.bounceRate}%

Test Duration: ${results.testDuration} days
Improvement: ${results.improvement.absolute.toFixed(1)}%
Statistical Significance: ${results.statisticalSignificance.isSignificant ? 'Yes' : 'No'}
Recommendation: ${results.recommendation}`

            const blob = new Blob([csv], { type: 'text/csv' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `converto-ab-test-${new Date().toISOString().split('T')[0]}.csv`
            a.click()
          }}
          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
        >
          📊 Export CSV
        </button>

        <button
          onClick={() => {
            if (confirm('Are you sure you want to disable the A/B test?')) {
              localStorage.setItem('converto_ab_test_disabled', 'true')
              window.location.reload()
            }
          }}
          className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors"
        >
          🛑 Stop Test
        </button>
      </div>

      {/* Footer */}
      <div className="text-xs text-gray-400 mt-3 text-center">
        Auto-refresh every 30s
      </div>
    </div>
  )
}

// Toggle component for showing/hiding dashboard
export function ABTestDashboardToggle() {
  const [showDashboard, setShowDashboard] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowDashboard(!showDashboard)}
        className="fixed bottom-4 left-4 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg transition-colors z-50"
        title="Toggle A/B Test Dashboard"
      >
        {showDashboard ? '📊' : '📈'} A/B Test
      </button>

      <ABTestDashboard isVisible={showDashboard} />
    </>
  )
}
