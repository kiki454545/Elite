'use client'

import { useState, useEffect, useRef } from 'react'
import { MapPin, ChevronDown, X } from 'lucide-react'
import { COUNTRIES, Country } from '@/contexts/CountryContext'
import { searchCities } from '@/data/cities'

interface LocationSelectorProps {
  onLocationChange: (country: string, city: string) => void
  initialCountry?: string
  initialCity?: string
}

export default function LocationSelector({
  onLocationChange,
  initialCountry = 'FR',
  initialCity = ''
}: LocationSelectorProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    COUNTRIES.find(c => c.code === initialCountry) || COUNTRIES[0]
  )
  const [cityQuery, setCityQuery] = useState(initialCity)
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)
  const [citySuggestions, setCitySuggestions] = useState<string[]>([])
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [selectedCity, setSelectedCity] = useState(initialCity)

  const cityInputRef = useRef<HTMLInputElement>(null)
  const cityDropdownRef = useRef<HTMLDivElement>(null)
  const countryDropdownRef = useRef<HTMLDivElement>(null)

  // Search cities when query changes
  useEffect(() => {
    if (cityQuery.length >= 2) {
      const results = searchCities(selectedCountry.code, cityQuery)
      setCitySuggestions(results)
      setShowCitySuggestions(true)
    } else {
      setCitySuggestions([])
      setShowCitySuggestions(false)
    }
  }, [cityQuery, selectedCountry.code])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        cityDropdownRef.current &&
        !cityDropdownRef.current.contains(event.target as Node) &&
        cityInputRef.current &&
        !cityInputRef.current.contains(event.target as Node)
      ) {
        setShowCitySuggestions(false)
      }

      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCountryDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country)
    setShowCountryDropdown(false)
    // Reset city when country changes
    setCityQuery('')
    setSelectedCity('')
    onLocationChange(country.code, '')
  }

  const handleCitySelect = (city: string) => {
    setCityQuery(city)
    setSelectedCity(city)
    setShowCitySuggestions(false)
    onLocationChange(selectedCountry.code, city)
  }

  const handleCityInputChange = (value: string) => {
    setCityQuery(value)
    setSelectedCity('') // Reset selected city when typing
  }

  const clearCity = () => {
    setCityQuery('')
    setSelectedCity('')
    onLocationChange(selectedCountry.code, '')
    cityInputRef.current?.focus()
  }

  return (
    <div className="space-y-4">
      {/* Country Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Pays
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-4 text-white flex items-center justify-between hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">{selectedCountry.flag}</span>
              <span>{selectedCountry.name}</span>
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showCountryDropdown && (
            <div
              ref={countryDropdownRef}
              className="absolute z-50 w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-64 overflow-y-auto"
            >
              {COUNTRIES.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors flex items-center gap-2 ${
                    selectedCountry.code === country.code ? 'bg-gray-700' : ''
                  }`}
                >
                  <span className="text-2xl">{country.flag}</span>
                  <span className="text-white">{country.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* City Autocomplete */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Ville <span className="text-xs text-gray-500">(commencez à taper)</span>
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref={cityInputRef}
            type="text"
            value={cityQuery}
            onChange={(e) => handleCityInputChange(e.target.value)}
            onFocus={() => {
              if (citySuggestions.length > 0) {
                setShowCitySuggestions(true)
              }
            }}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 pl-11 pr-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
            placeholder={`Ville en ${selectedCountry.name}...`}
            autoComplete="off"
          />
          {cityQuery && (
            <button
              type="button"
              onClick={clearCity}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {showCitySuggestions && citySuggestions.length > 0 && (
            <div
              ref={cityDropdownRef}
              className="absolute z-50 w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-64 overflow-y-auto"
            >
              {citySuggestions.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => handleCitySelect(city)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors text-white border-b border-gray-700 last:border-b-0"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{city}</span>
                    <span className="text-xs text-gray-500 ml-auto">{selectedCountry.flag}</span>
                  </div>
                </button>
              ))}
              {citySuggestions.length === 0 && cityQuery.length >= 2 && (
                <div className="px-4 py-3 text-gray-400 text-sm">
                  Aucune ville trouvée
                </div>
              )}
            </div>
          )}
        </div>

        {/* Selected City Display */}
        {selectedCity && (
          <div className="mt-2 flex items-center gap-2 text-sm">
            <span className="text-green-400">✓</span>
            <span className="text-gray-300">
              Ville sélectionnée: <span className="text-white font-medium">{selectedCity}, {selectedCountry.name}</span>
            </span>
          </div>
        )}

        {/* Minimum 2 characters hint */}
        {!selectedCity && cityQuery.length < 2 && cityQuery.length > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            Entrez au moins 2 caractères pour rechercher
          </p>
        )}
      </div>
    </div>
  )
}
