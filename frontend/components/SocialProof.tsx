"use client"

interface SocialProofProps {
  companyCount?: number
  testimonials?: Array<{
    name: string
    company: string
    text: string
    avatar?: string
  }>
}

export default function SocialProof({
  companyCount = 50,
  testimonials = []
}: SocialProofProps) {
  return (
    <section className="py-16 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Company Count */}
        <div className="text-center mb-12">
          <p className="text-2xl font-semibold text-gray-900 mb-2">
            {companyCount}+ suomalaista yritystä jo käytössä
          </p>
          <p className="text-gray-600">Luottavat Converto Solutions -brändiin</p>
        </div>

        {/* Logo Gallery (placeholder) */}
        <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 mb-12">
          {/* Placeholder logos - replace with actual logos */}
          <div className="text-gray-400 text-sm font-medium">Logo 1</div>
          <div className="text-gray-400 text-sm font-medium">Logo 2</div>
          <div className="text-gray-400 text-sm font-medium">Logo 3</div>
          <div className="text-gray-400 text-sm font-medium">Logo 4</div>
          <div className="text-gray-400 text-sm font-medium">Logo 5</div>
        </div>

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-gray-700 mb-4">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  {testimonial.avatar && (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                      {testimonial.avatar}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
