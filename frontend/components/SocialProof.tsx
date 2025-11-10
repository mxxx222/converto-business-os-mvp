'use client';

export function SocialProof() {
  return (
    <div className="bg-white border-2 border-blue-200 rounded-xl p-6 text-center shadow-lg">
      
      {/* User Avatars */}
      <div className="flex items-center justify-center -space-x-3 mb-4">
        {[
          { initials: 'MK', color: 'from-blue-400 to-blue-600' },
          { initials: 'TL', color: 'from-green-400 to-green-600' },
          { initials: 'AS', color: 'from-purple-400 to-purple-600' },
          { initials: 'JH', color: 'from-orange-400 to-orange-600' },
          { initials: 'RL', color: 'from-pink-400 to-pink-600' }
        ].map((user, i) => (
          <div 
            key={i}
            className={`w-12 h-12 bg-gradient-to-br ${user.color} rounded-full border-4 border-white flex items-center justify-center text-white font-bold shadow-lg`}
          >
            {user.initials}
          </div>
        ))}
        <div className="w-12 h-12 bg-gray-200 rounded-full border-4 border-white flex items-center justify-center text-gray-600 font-bold shadow-lg">
          +3
        </div>
      </div>

      <p className="text-gray-700 mb-2">
        <strong className="text-blue-600">8 yritystä</strong> ilmoittautunut beta-ohjelmaan
      </p>
      <p className="text-sm text-gray-600 mb-4">
        🕐 Viimeisin ilmoittautuminen 2 tuntia sitten
      </p>

      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-2xl mb-1">🇪🇺</div>
          <div className="text-xs text-gray-600 font-medium">EU Hosting</div>
        </div>
        <div className="text-center">
          <div className="text-2xl mb-1">🔒</div>
          <div className="text-xs text-gray-600 font-medium">GDPR</div>
        </div>
        <div className="text-center">
          <div className="text-2xl mb-1">⚡</div>
          <div className="text-xs text-gray-600 font-medium">99.9% SLA</div>
        </div>
      </div>

      {/* Additional trust elements */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Suomi
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            24/7 Monitoring
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
            ISO 27001
          </span>
        </div>
      </div>
    </div>
  );
}
