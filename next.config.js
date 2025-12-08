/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Désactiver l'optimisation Vercel (limite gratuite atteinte)
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upfsgpzcvdvtuygwaizd.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.sexelite.eu',
        pathname: '/**',
      },
    ],
  },
  // Compression
  compress: true,
}

module.exports = nextConfig
