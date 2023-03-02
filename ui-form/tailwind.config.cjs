/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				body: ["Inter", "sans-serif"],
				mono: ["'Roboto Mono'", "monospace"],
			},
		},
	},
	plugins: [],
}
