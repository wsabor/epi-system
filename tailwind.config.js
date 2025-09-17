/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "senai-red": "#D32F2F",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
