/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "http",
                hostname: "assets.myntassets.com",
                pathname: "/v1/images/**"
            },
            {
                protocol: "https",
                hostname: "storage.googleapis.com",
                pathname: "/**"
            },
            {
                protocol: "https",
                hostname: "images.gopuff.com",
                pathname: "/**"
            },
        ]
    },
    // experimental: {
    //     swcPlugins: [["@preact-signals/safe-react/swc", {}]],
    // },
};

export default nextConfig;
