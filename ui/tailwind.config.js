module.exports = {
	content: ['./src/**/*.{js,jsx,ts,tsx}'],
	theme: {
		extend: {
			fontFamily: {
				body: ['Montserrat', 'sans-serif'],
			},
			animation: {
				path: 'dash 5s linear infinite',
			},
			keyframes: {
				dash: {
					to: {
						'stroke-dashoffset': 0,
					},
				},
			},
		},
	},
	plugins: [require('tailwind-scrollbar')],
}
