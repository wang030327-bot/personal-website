import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx,mdx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"]
      },
      colors: {
        ink: {
          50: "#ece8df",
          100: "#e2ddd3",
          200: "#ccc4b8",
          700: "#403c36",
          800: "#2d2a26",
          900: "#1f1d1a"
        },
        accent: {
          100: "#e8f3ef",
          200: "#c5ddd1",
          500: "#4f8b73",
          700: "#2d5948"
        }
      },
      boxShadow: {
        soft: "0 20px 40px -28px rgba(20, 22, 19, 0.45)"
      },
      backgroundImage: {
        paper:
          "radial-gradient(circle at 20% 15%, rgba(79, 139, 115, 0.08), transparent 40%), radial-gradient(circle at 80% 25%, rgba(76, 92, 145, 0.07), transparent 42%), radial-gradient(circle at 50% 80%, rgba(228, 196, 160, 0.09), transparent 48%)"
      }
    }
  },
  plugins: [typography]
};

export default config;
