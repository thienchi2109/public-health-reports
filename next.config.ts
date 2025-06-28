import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // serverActions: { // Đã bị chú thích hoặc xóa do không được hỗ trợ trong phiên bản Next.js này
  //   bodySizeLimit: '5mb',
  // },
};

export default nextConfig;
