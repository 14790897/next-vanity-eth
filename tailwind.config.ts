import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      keyframes: {
        "octocat-wave": {
          "0%, 100%": { transform: "rotate(0)" },
          "20%, 60%": { transform: "rotate(-25deg)" },
          "40%, 80%": { transform: "rotate(10deg)" },
        },
      },
      animation: {
        "octocat-wave": "octocat-wave 560ms ease-in-out",
      },
    },
  },
  plugins: [],
};
export default config;
