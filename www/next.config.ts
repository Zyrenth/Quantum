import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'export',
    distDir: '../out',
    unoptimized: true,
};

export default nextConfig;
