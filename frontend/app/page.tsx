// A/B Testing Enabled Page
// Use client-only component to prevent SSR hydration issues
import dynamic from 'next/dynamic'

const ABTestPage = dynamic(() => import("@/components/ABTestPage"), {
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
  return <ABTestPage />
}
