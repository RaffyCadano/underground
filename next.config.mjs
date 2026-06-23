const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['@prisma/client'],
  webpack: (config, { nextRuntime }) => {
    if (nextRuntime === 'edge') {
      config.output.globalObject = 'globalThis';
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
