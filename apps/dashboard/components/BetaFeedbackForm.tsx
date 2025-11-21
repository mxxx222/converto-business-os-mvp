'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

interface FeedbackData {
  satisfaction_score: number
  nps_score: number
  whats_working: string
  improvements: string
  feature_requests: string
  would_recommend: boolean
}

export function BetaFeedbackForm() {
  const [formData, setFormData] = useState<FeedbackData>({
    satisfaction_score: 0,
    nps_score: 0,
    whats_working: '',
    improvements: '',
    feature_requests: '',
    would_recommend: false,
  })

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.satisfaction_score === 0 || formData.nps_score === 0) {
      setErrorMessage('Please provide satisfaction and NPS scores')
      return
    }

    setStatus('loading')
    setErrorMessage('')

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Please log in to submit feedback')
      }

      // Save feedback to Supabase
      const { error } = await supabase
        .from('beta_feedback')
        .insert({
          user_id: user.id,
          satisfaction_score: formData.satisfaction_score,
          nps_score: formData.nps_score,
          whats_working: formData.whats_working || null,
          improvements: formData.improvements || null,
          feature_requests: formData.feature_requests || null,
          would_recommend: formData.would_recommend,
        })

      if (error) {
        throw error
      }

      setStatus('success')
      toast.success('Kiitos palautteesta!', {
        description: 'Palautteesi auttaa meitä parantamaan DocFlow:ia.',
      })

      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          satisfaction_score: 0,
          nps_score: 0,
          whats_working: '',
          improvements: '',
          feature_requests: '',
          would_recommend: false,
        })
        setStatus('idle')
      }, 3000)
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred')
      toast.error('Palautteen lähetys epäonnistui', {
        description: 'Yritä uudelleen hetken kuluttua.',
      })
    }
  }

  if (status === 'success') {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Kiitos palautteesta! 🎉</h3>
            <p className="text-gray-600">
              Palautteesi auttaa meitä parantamaan DocFlow:ia. Arvostamme aikaasi!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Viikoittainen palaute</CardTitle>
        <CardDescription>
          Auta meitä parantamaan DocFlow:ia. Vastaa muutamaan kysymykseen (2-3 min).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {status === 'error' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Virhe</p>
                <p className="text-sm text-red-600">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Satisfaction Score */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              1. Kuinka tyytyväinen olet DocFlow:iin? (1-10)
            </Label>
            <RadioGroup
              value={formData.satisfaction_score.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, satisfaction_score: parseInt(value) })
              }
              className="grid grid-cols-5 gap-2"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                <div key={score} className="flex items-center space-x-2">
                  <RadioGroupItem value={score.toString()} id={`satisfaction-${score}`} />
                  <Label htmlFor={`satisfaction-${score}`} className="cursor-pointer">
                    {score}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* NPS Score */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              2. Kuinka todennäköisesti suosittelisit DocFlow:ia muille? (0-10)
            </Label>
            <RadioGroup
              value={formData.nps_score.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, nps_score: parseInt(value) })
              }
              className="grid grid-cols-6 gap-2"
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                <div key={score} className="flex items-center space-x-2">
                  <RadioGroupItem value={score.toString()} id={`nps-${score}`} />
                  <Label htmlFor={`nps-${score}`} className="cursor-pointer text-sm">
                    {score}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            <p className="text-xs text-gray-500 mt-2">
              0 = En suosittele, 10 = Suosittelen vahvasti
            </p>
          </div>

          {/* What's Working */}
          <div>
            <Label htmlFor="whats_working" className="text-base font-semibold mb-2 block">
              3. Mikä toimii hyvin DocFlow:ssa?
            </Label>
            <Textarea
              id="whats_working"
              value={formData.whats_working}
              onChange={(e) => setFormData({ ...formData, whats_working: e.target.value })}
              placeholder="Kerro mitä pidät DocFlow:sta..."
              rows={3}
              className="w-full"
            />
          </div>

          {/* Improvements */}
          <div>
            <Label htmlFor="improvements" className="text-base font-semibold mb-2 block">
              4. Mitä pitäisi parantaa?
            </Label>
            <Textarea
              id="improvements"
              value={formData.improvements}
              onChange={(e) => setFormData({ ...formData, improvements: e.target.value })}
              placeholder="Kerro mitä voisi olla paremmin..."
              rows={3}
              className="w-full"
            />
          </div>

          {/* Feature Requests */}
          <div>
            <Label htmlFor="feature_requests" className="text-base font-semibold mb-2 block">
              5. Mitä uutta ominaisuutta toivoisit? (valinnainen)
            </Label>
            <Textarea
              id="feature_requests"
              value={formData.feature_requests}
              onChange={(e) => setFormData({ ...formData, feature_requests: e.target.value })}
              placeholder="Kerro ideoistasi..."
              rows={3}
              className="w-full"
            />
          </div>

          <Button
            type="submit"
            disabled={status === 'loading' || formData.satisfaction_score === 0 || formData.nps_score === 0}
            className="w-full"
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Lähetetään...
              </>
            ) : (
              'Lähetä palaute'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

