/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172235",
        muted: "#78869a",
        canvas: "#f4f7fb",
        teal: {
          50: "#e9f8f3",
          100: "#d3f1e7",
          500: "#1ba88a",
          600: "#12866e"
        }
      },
      boxShadow: {
        card: "0 8px 28px rgba(31, 48, 71, 0.06)"
      }
    }
  },
  plugins: []
};
