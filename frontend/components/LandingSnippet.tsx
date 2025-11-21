'use client';

import { useState } from 'react';
import { CheckCircle2, Zap, Shield, ArrowRight } from 'lucide-react';
import { track } from '@/lib/track';

/**
 * Landing Snippet - 7 ruutua mobiili-first designilla
 * "Vaikea kieltäytyä" -CTA deployment-automaatiosta
 */
export function LandingSnippet() {
  const [showDryRun, setShowDryRun] = useState(false);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 md:py-12">
      {/* Ruutu 1 – Ydinlupaus */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 md:p-8 mb-6 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-8 h-8 text-yellow-300" />
          <h2 className="text-2xl md:text-3xl font-bold">Deploy 30 sekunnissa. Ilman riskiä.</h2>
        </div>
        <p className="text-blue-100 text-lg md:text-xl">
          Yksi komento. Selkeä rollback. Nolla säätöä.
        </p>
      </div>

      {/* Ruutu 2 – Kipu */}
      <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 mb-6">
        <h3 className="text-xl md:text-2xl font-bold text-red-900 mb-2">
          Hidas deploy = hukattu luottamus ja yöunet.
        </h3>
        <p className="text-red-700">
          Jokainen manuaalinen vaihe on riski. Jokainen viive maksaa.
        </p>
      </div>

      {/* Ruutu 3 – Opas */}
      <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6 mb-6">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-blue-900 mb-2">
              Me hoidamme kurin. Sinä pidät ohjat.
            </h3>
            <p className="text-blue-700">
              Automaatio hoitaa työt. Sinä päätät milloin ja miten.
            </p>
          </div>
        </div>
      </div>

      {/* Ruutu 4 – Suunnitelma */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
        <h3 className="text-xl md:text-2xl font-bold mb-4">3 askelta</h3>
        <ol className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
              1
            </span>
            <span className="text-gray-700 pt-1">Lisää env‑avaimet</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
              2
            </span>
            <span className="text-gray-700 pt-1">Aja health + status</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
              3
            </span>
            <span className="text-gray-700 pt-1">Deploy staging → tuotanto</span>
          </li>
        </ol>
      </div>

      {/* Ruutu 5 – Todiste */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
        <h3 className="text-xl md:text-2xl font-bold text-green-900 mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6" />
          Todistetut tulokset
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">20×</div>
            <div className="text-sm text-gray-600 mt-1">nopeampi deploy</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">15×</div>
            <div className="text-sm text-gray-600 mt-1">nopeampi recovery</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">&lt;1%</div>
            <div className="text-sm text-gray-600 mt-1">virheet</div>
          </div>
        </div>
      </div>

      {/* Ruutu 6 – Riskin poisto */}
      <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-6 mb-6">
        <h3 className="text-xl md:text-2xl font-bold text-yellow-900 mb-2">
          Riskin poisto
        </h3>
        <p className="text-yellow-800">
          Kuivaharjoitus tuettu. Rollback yhdellä komennolla.
        </p>
      </div>

      {/* Ruutu 7 – CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 md:p-10 text-white shadow-2xl">
        <div className="text-center mb-6">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Aja nyt
          </h3>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6 font-mono text-lg md:text-xl break-all">
            <code className="text-yellow-300">docflow-deploy status</code>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => {
              // Copy command to clipboard
              navigator.clipboard.writeText('docflow-deploy status');
              track('landing_cta_clicked', {
                action: 'copy_command',
                command: 'docflow-deploy status',
                location: 'landing_snippet'
              });
              alert('Komento kopioitu leikepöydälle!');
            }}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-lg"
          >
            Kopioi komento
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              setShowDryRun(!showDryRun);
              if (!showDryRun) {
                track('dry_run_clicked', {
                  action: 'show_dry_run',
                  location: 'landing_snippet'
                });
              }
            }}
            className="text-white/90 hover:text-white underline text-sm md:text-base transition-colors"
          >
            {showDryRun ? 'Piilota' : 'Kuivaharjoitus ensin →'}
          </button>
        </div>

        {showDryRun && (
          <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-sm mb-2 text-white/90">Pehmeä aloitus (ilman muutoksia):</p>
            <code className="text-yellow-300 font-mono text-sm md:text-base block break-all">
              docflow-deploy deploy --dry-run
            </code>
          </div>
        )}
      </div>
    </div>
  );
}

