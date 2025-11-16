'use client'

interface WatermarkProps {
  size?: 'small' | 'medium' | 'large'
}

export function Watermark({ size = 'medium' }: WatermarkProps) {
  const sizeClasses = {
    small: 'text-2xl',
    medium: 'text-4xl',
    large: 'text-6xl',
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10">
      <div className="relative">
        {/* Filigrane principal */}
        <div
          className={`${sizeClasses[size]} font-bold text-white/20 transform rotate-[-25deg] tracking-wider`}
          style={{
            textShadow: '0 0 20px rgba(0,0,0,0.5)',
            userSelect: 'none',
            WebkitUserSelect: 'none',
          }}
        >
          SEXELITE
        </div>

        {/* Filigrane répété en arrière-plan pour plus de protection */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-2 gap-4 h-full">
            <div className="flex items-center justify-center text-white/30 text-sm font-bold transform rotate-[-25deg]">
              SEXELITE
            </div>
            <div className="flex items-center justify-center text-white/30 text-sm font-bold transform rotate-[-25deg]">
              SEXELITE
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
