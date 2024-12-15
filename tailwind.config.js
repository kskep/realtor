/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui';

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyUI: {
    themes: [
      "light",
      "dark",
      "corporate" // you can add more themes
    ],
  }
}