module.exports = {
	content: ['./src/**/*.{js,jsx,ts,tsx}'],
	theme: {
		extend: {
			fontFamily: {
				body: ['Montserrat', 'sans-serif'],
			},
		},
	},
	plugins: [require('tailwind-scrollbar')],
}
