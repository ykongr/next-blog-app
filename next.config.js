const nextConfig = {
  eslint: {
    // これを true にすると、ビルド時の Lint エラーを無視してデプロイを強行します
    ignoreDuringBuilds: true,
  },
  // 他の設定があればそのまま残す
  /* config options here */
  devIndicators: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "w1980.blob.core.windows.net" },
      { protocol: "https", hostname: "placehold.jp" },
      { protocol: "https", hostname: "images.microcms-assets.io" },
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

module.exports = nextConfig;
