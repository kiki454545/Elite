'use client'

import { useState, useEffect, useRef } from 'react'
import { MapPin, Navigation, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface City {
  id: string
  name: string
  department: string
  department_code: string
  latitude: number
  longitude: number
}

interface LocationSearchProps {
  onLocationChange: (city: City | null, radius: number | null) => void
  className?: string
}

const RADIUS_OPTIONS = [
  { value: null, label: 'Toute la France' },
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 25, label: '25 km' },
  { value: 50, label: '50 km' },
  { value: 100, label: '100 km' },
]

export function LocationSearch({ onLocationChange, className = '' }: LocationSearchProps) {
  const [cities, setCities] = useState<City[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const [selectedRadius, setSelectedRadius] = useState<number | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Charger toutes les villes au démarrage
  useEffect(() => {
    loadCities()
  }, [])

  // Fermer le dropdown si on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function loadCities() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('french_cities')
        .select('id, name, department, department_code, latitude, longitude')
        .order('population', { ascending: false })

      if (error) throw error
      setCities(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des villes:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrer les villes selon la recherche
  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    city.department.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 10) // Limiter à 10 résultats

  const handleCitySelect = (city: City) => {
    setSelectedCity(city)
    setSearchQuery(city.name)
    setShowDropdown(false)
    onLocationChange(city, selectedRadius)
  }

  const handleRadiusChange = (radius: number | null) => {
    setSelectedRadius(radius)
    onLocationChange(selectedCity, radius)
  }

  const handleClear = () => {
    setSelectedCity(null)
    setSearchQuery('')
    setSelectedRadius(null)
    onLocationChange(null, null)
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Sélecteur de ville */}
      <div className="relative" ref={dropdownRef}>
        <label className="text-gray-300 text-sm font-medium mb-2 block">
          Ville
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Rechercher une ville..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setShowDropdown(true)
              if (!e.target.value) {
                setSelectedCity(null)
                onLocationChange(null, selectedRadius)
              }
            }}
            onFocus={() => setShowDropdown(true)}
            className="w-full bg-gray-900 text-white pl-10 pr-10 py-2.5 rounded-lg border border-gray-700 focus:border-pink-500 focus:outline-none text-sm"
          />
          {selectedCity && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdown avec la liste des villes */}
        {showDropdown && searchQuery && (
          <div className="absolute z-50 w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-400 text-sm">
                Chargement...
              </div>
            ) : filteredCities.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-sm">
                Aucune ville trouvée
              </div>
            ) : (
              <div className="py-1">
                {filteredCities.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => handleCitySelect(city)}
                    className="w-full px-4 py-2.5 text-left hover:bg-gray-700 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 group-hover:text-pink-500 transition-colors flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-medium truncate">
                          {city.name}
                        </div>
                        <div className="text-gray-400 text-xs truncate">
                          {city.department} ({city.department_code})
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sélecteur de rayon - affiché seulement si une ville est sélectionnée */}
      {selectedCity && (
        <div>
          <label className="text-gray-300 text-sm font-medium mb-2 block">
            Rayon de recherche
          </label>
          <div className="grid grid-cols-3 gap-2">
            {RADIUS_OPTIONS.map((option) => (
              <button
                key={option.value ?? 'all'}
                onClick={() => handleRadiusChange(option.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedRadius === option.value
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg scale-105'
                    : 'bg-gray-900 text-gray-300 hover:bg-gray-700 border border-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Info sur la sélection active */}
      {selectedCity && selectedRadius && (
        <div className="bg-pink-500/10 border border-pink-500/20 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Navigation className="w-4 h-4 text-pink-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-pink-200">
              Recherche dans un rayon de <span className="font-semibold">{selectedRadius} km</span> autour de{' '}
              <span className="font-semibold">{selectedCity.name}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
