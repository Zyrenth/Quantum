import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'export',
    distDir: '../out',
    typescript: {
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
