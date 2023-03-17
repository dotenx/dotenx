/* eslint-disable no-undef */

;(async () => {
	const id = '{{id}}'

	const root = document.getElementById(id)
	const items = root.querySelectorAll('.item')
	;[...items].forEach((item) => {
		const description = item.querySelector('.description')
		item.addEventListener('click', () => {
			description.style.display = description.style.display === 'none' ? 'block' : 'none'
		})
	})
})()
