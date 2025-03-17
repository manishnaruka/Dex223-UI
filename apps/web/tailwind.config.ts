const emptyImagePath = "/images/empty-large";

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("@repo/tailwind-config/tailwind-presets")],
  theme: {
    extend: {
      backgroundImage: {
        "empty-no-pinned-tokens": `url('${emptyImagePath}/no-pinned.svg')`,
      },
    },
  },
};
