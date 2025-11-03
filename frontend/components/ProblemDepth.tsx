"use client"

interface ProblemDepthItem {
  category: string
  title: string
  description: string
  icon: string
}

interface ProblemDepthProps {
  title?: string
  items: ProblemDepthItem[]
}

export default function ProblemDepth({
  title = "Manuaaliset prosessit maksavat enemmän kuin arvaat.",
  items
}: ProblemDepthProps) {
  return (
    <section className="py-20 px-6 bg-red-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">{title}</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {items.map((item, i) => (
            <div key={i} className="p-6 bg-white rounded-xl shadow-sm border border-red-200">
              <div className="text-4xl mb-4">{item.icon}</div>
              <div className="text-sm font-semibold text-red-600 mb-2">{item.category}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-700">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
