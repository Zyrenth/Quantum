import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "success-solid-light-bg": "#83FA9D",
        "success-solid-light-text": "#000000",
        "success-solid-dark-bg": "#83FA9D",
        "success-solid-dark-text": "#000000",
        "success-soft-light-bg": "#83FA9D40",
        "success-soft-light-text": "#058020",
        "success-soft-dark-bg": "#83FA9D40",
        "success-soft-dark-text": "#83FA9D",
        "warning-solid-light-bg": "#FAE083",
        "warning-solid-light-text": "#000000",
        "warning-solid-dark-bg": "#FAE083",
        "warning-solid-dark-text": "#000000",
        "warning-soft-light-bg": "#FAE08340",
        "warning-soft-light-text": "#806505",
        "warning-soft-dark-bg": "#FAE08340",
        "warning-soft-dark-text": "#FAE083",
        "danger-solid-light-bg": "#FA8383",
        "danger-solid-light-text": "#000000",
        "danger-solid-dark-bg": "#FA8383",
        "danger-solid-dark-text": "#000000",
        "danger-soft-light-bg": "#FA838340",
        "danger-soft-light-text": "#9E0606",
        "danger-soft-dark-bg": "#FA838340",
        "danger-soft-dark-text": "#FA8383",
        "info-solid-light-bg": "#83D6FA",
        "info-solid-light-text": "#000000",
        "info-solid-dark-bg": "#83D6FA",
        "info-solid-dark-text": "#000000",
        "info-soft-light-bg": "#83D6FA40",
        "info-soft-light-text": "#055B80",
        "info-soft-dark-bg": "#83D6FA40",
        "info-soft-dark-text": "#83D6FA",
      },
    },
  },
  plugins: [],
} satisfies Config;