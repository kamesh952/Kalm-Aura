/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
        colors:{
            "kalmkart":"#ea2e0e",
        }
    },
  },
 plugins: [
  require('tailwind-scrollbar-hide')
],

}
