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
