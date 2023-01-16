/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				body: ["Montserrat", "sans-serif"],
				mono: ["'Roboto Mono'", "monospace"],
			},
			animation: {
				path: "dash 5s linear infinite",
			},
			keyframes: {
				dash: {
					to: {
						"stroke-dashoffset": 0,
					},
				},
			},
		},
	},
	plugins: [require("tailwind-scrollbar")({ nocompatible: true })],
}
