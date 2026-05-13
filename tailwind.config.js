/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'zhihu-blue': '#0066FF',
        'deep-night': '#0A0B10',
        'deep-ocean': '#001a4d',
        'glass-white': 'rgba(255,255,255,0.05)',
        'glass-border': 'rgba(255,255,255,0.1)',
        'text-primary': 'rgba(255,255,255,0.8)',
        'text-secondary': 'rgba(255,255,255,0.5)',
      },
      fontFamily: {
        zhihu: ['-apple-system', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
      },
      backdropBlur: {
        glass: '20px',
      },
    },
  },
  plugins: [],
}
