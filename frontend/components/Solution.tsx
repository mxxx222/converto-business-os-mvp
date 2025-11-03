"use client"

interface SolutionItem {
  feature: string
  benefit: string
  savings: string
  icon: string
}

interface SolutionProps {
  title: string
  items: SolutionItem[]
}

export default function Solution({ title, items }: SolutionProps) {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {items.map((item, i) => (
            <div key={i} className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{item.feature}</h3>
              <p className="text-gray-700 mb-4">{item.benefit}</p>
              <div className="text-lg font-semibold text-green-600">
                {item.savings}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
