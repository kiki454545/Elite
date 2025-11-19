'use client'

import { translateAdData } from '@/i18n/config'
import i18n from '@/i18n/config'

export default function DebugI18nPage() {
  const testTranslations = [
    { key: 'meetingPlaces.Incall', lang: 'fr' },
    { key: 'meetingPlaces.Incall', lang: 'en' },
    { key: 'services.French Kiss', lang: 'fr' },
    { key: 'services.French Kiss', lang: 'en' },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Debug i18n Translations</h1>

      <div className="space-y-4">
        <div className="bg-gray-900 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Loaded Resources</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(i18n.store.data, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-900 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Test Translations</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-2">Key</th>
                <th className="text-left p-2">Language</th>
                <th className="text-left p-2">Result</th>
              </tr>
            </thead>
            <tbody>
              {testTranslations.map((test, i) => (
                <tr key={i} className="border-b border-gray-800">
                  <td className="p-2 font-mono text-xs">{test.key}</td>
                  <td className="p-2">{test.lang}</td>
                  <td className="p-2 font-bold text-pink-400">
                    {translateAdData(test.key, test.lang)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
