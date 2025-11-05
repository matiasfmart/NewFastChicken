import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Evita que MongoDB se incluya en el bundle del cliente
  serverExternalPackages: ['mongodb'],
  webpack: (config, { isServer }) => {
    // MongoDB solo debe ejecutarse en el servidor
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        mongodb: false,
        'mongodb-client-encryption': false,
        fs: false,
        net: false,
        tls: false,
        'child_process': false,
        'fs/promises': false,
        dns: false,
        'timers/promises': false,
      };
    }
    return config;
  },
};

export default nextConfig;
