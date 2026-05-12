import path from 'path';
import { fileURLToPath } from 'url';
import webpack from 'webpack';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        buffer: false,
        stream: false,
      };

      config.experiments = {
        ...config.experiments,
        asyncWebAssembly: true,
      };

      // Replace Node.js-specific require("node:module") calls in manifold-3d's bundled JS
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^node:module$/,
          path.resolve(__dirname, 'src/lib/shims/node-module.js')
        )
      );
    }
    return config;
  },
};

export default nextConfig;
