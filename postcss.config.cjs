const isProduction = process.env.NODE_ENV === "production";

const { purgeCSSPlugin } = require("@fullhuman/postcss-purgecss");

module.exports = {
  plugins: [
    isProduction &&
      purgeCSSPlugin({
        content: ["./src/**/*.html", "./src/**/*.ts", "./src/**/*.tsx"],
        defaultExtractor: (content) => {
          return (content.match(/[\w-/:]+/g) || []).filter(
            (token) => !token.endsWith(":")
          );
        },
      }),
    require("autoprefixer"),
    require("cssnano")({
      preset: "advanced",
    }),
  ].filter(Boolean),
};
