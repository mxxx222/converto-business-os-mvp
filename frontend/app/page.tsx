// Landing Page - Simple version without A/B testing to avoid hydration issues
import dynamic from 'next/dynamic'

const SimpleLandingPage = dynamic(() => import("@/components/SimpleLandingPage"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
    </div>
  )
})

export const metadata = {
  title: "Converto Solutions – Automate your entire business stack",
  description: "Converto Solutions – Yksi brändi, kaikki ratkaisut. Business OS SaaS ja automaatio- ja koodauspalvelut. Automatisoi yrityksesi.",
}

export default function Page() {
  return <SimpleLandingPage />
}
