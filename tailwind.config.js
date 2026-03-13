module.exports = {
  darkMode: "class",
  content: [
    './*.html',
    './Assets/**/*.html',
    './projects/**/*.html',
    './templates/**/*.html',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060d1f', // You can change this to your preferred navy hex
        },
      },
    },
  },
  plugins: [],
};
