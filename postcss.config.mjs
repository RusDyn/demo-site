import autoprefixer from "autoprefixer";

const isProduction = process.env.NODE_ENV === "production";

const config = {
  plugins: {
    "@tailwindcss/postcss": { optimize: isProduction },
    autoprefixer: {},
  },
};

export default config;
