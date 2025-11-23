'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { MapPin, Navigation, X } from 'lucide-react'
import { CITIES_BY_COUNTRY } from '@/data/cities'
import { useCountry } from '@/contexts/CountryContext'

interface City {
  name: string
  country: string
}

interface LocationSearchProps {
  onLocationChange: (city: City | null, radius: number | null) => void
  className?: string
}

const RADIUS_OPTIONS = [
  { value: null, label: 'Toutes les villes' },
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 25, label: '25 km' },
  { value: 50, label: '50 km' },
  { value: 100, label: '100 km' },
]

export function LocationSearch({ onLocationChange, className = '' }: LocationSearchProps) {
  const { selectedCountry } = useCountry()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const [selectedRadius, setSelectedRadius] = useState<number | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Charger les villes du pays sélectionné
  const citiesForCountry = CITIES_BY_COUNTRY[selectedCountry.code] || []

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

  // Filtrer les villes selon la recherche (minimum 2 caractères) avec useMemo pour optimiser
  const filteredCities = useMemo(() => {
    if (searchQuery.length < 2) return []

    const query = searchQuery.toLowerCase()
    return citiesForCountry
      .filter(cityName => cityName.toLowerCase().includes(query))
      .slice(0, 15)
      .map(cityName => ({
        name: cityName,
        country: selectedCountry.code
      }))
  }, [searchQuery, citiesForCountry, selectedCountry.code])

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
              const value = e.target.value
              setSearchQuery(value)
              // N'ouvrir le dropdown que si on a 2 caractères ou plus
              setShowDropdown(value.length >= 2)
              if (!value) {
                setSelectedCity(null)
                onLocationChange(null, selectedRadius)
              }
            }}
            onFocus={() => {
              // N'ouvrir le dropdown au focus que si on a déjà 2 caractères ou plus
              if (searchQuery.length >= 2) {
                setShowDropdown(true)
              }
            }}
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
        {showDropdown && searchQuery.length >= 2 && (
          <div className="absolute z-50 w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
            {filteredCities.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-sm">
                Aucune ville trouvée
              </div>
            ) : (
              <div className="py-1">
                {filteredCities.map((city, index) => (
                  <button
                    key={`${city.name}-${index}`}
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
                          {selectedCountry.name}
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

      {/* Info sur la sélection active */}
      {selectedCity && (
        <div className="bg-pink-500/10 border border-pink-500/20 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-pink-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-pink-200">
              Recherche filtrée pour <span className="font-semibold">{selectedCity.name}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
