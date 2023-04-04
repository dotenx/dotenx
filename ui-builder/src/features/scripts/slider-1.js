/* eslint-disable no-undef */

;(async () => {
	const id = '{{id}}'

	const root = document.getElementById(id)

	const cards = root.querySelector('.cards')
	const leftButton = root.querySelector('.leftButton')
	const rightButton = root.querySelector('.rightButton')

	leftButton.addEventListener('click', () => {
		cards.scrollLeft -= cards.offsetWidth
	})

	rightButton.addEventListener('click', () => {
		cards.scrollLeft += cards.offsetWidth
	})
})()
