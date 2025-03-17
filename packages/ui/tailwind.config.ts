/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "ui-",
  presets: [require("@repo/tailwind-config/tailwind-presets")]
};
