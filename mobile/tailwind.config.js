module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#E07B2A',
        secondary: '#3B3B3B',
        surface: '#F5F0EB',
        success: '#4CAF50',
        danger: '#E53935',
        bg: '#0D0C0B',
        card: '#161512',
      },
    },
  },
  plugins: [],
}
