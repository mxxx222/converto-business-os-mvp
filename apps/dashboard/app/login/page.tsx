'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [magicLinkEmail, setMagicLinkEmail] = useState('')
  const [passwordEmail, setPasswordEmail] = useState('')
  const [password, setPassword] = useState('')

  // Magic link tab
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!magicLinkEmail) {
      toast.error('Please enter your email address')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: magicLinkEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (error) throw error

      toast.success('Magic link sent! Check your email.')
      setMagicLinkEmail('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send magic link')
    } finally {
      setLoading(false)
    }
  }

  // Password tab
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordEmail || !password) {
      toast.error('Please enter both email and password')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: passwordEmail,
        password
      })

      if (error) throw error

      toast.success('Login successful!')
      router.push('/dashboard')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-2">
            <div className="text-4xl">📋</div>
          </div>
          <CardTitle className="text-center">DocFlow Admin</CardTitle>
          <CardDescription className="text-center">
            Sign in to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="magic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="magic">Magic Link</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
            </TabsList>
            
            <TabsContent value="magic" className="space-y-4 mt-4">
              <form onSubmit={handleMagicLink} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="magic-email">Email address</Label>
                  <Input
                    id="magic-email"
                    type="email"
                    placeholder="admin@docflow.fi"
                    value={magicLinkEmail}
                    onChange={(e) => setMagicLinkEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || !magicLinkEmail}
                >
                  {loading ? 'Sending...' : 'Send Magic Link'}
                </Button>
              </form>
              <p className="text-xs text-muted-foreground text-center">
                We'll send you a secure link to sign in without a password
              </p>
            </TabsContent>
            
            <TabsContent value="password" className="space-y-4 mt-4">
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password-email">Email address</Label>
                  <Input
                    id="password-email"
                    type="email"
                    placeholder="admin@docflow.fi"
                    value={passwordEmail}
                    onChange={(e) => setPasswordEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || !passwordEmail || !password}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
