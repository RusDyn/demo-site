import autoprefixer from "autoprefixer";
import tailwindcss from "@tailwindcss/postcss";

const config = {
  plugins: {
    "@tailwindcss/postcss": { optimize: false },
    autoprefixer: {},
  },
};

export default config;
