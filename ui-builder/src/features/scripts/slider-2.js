/* eslint-disable no-undef */

;(async () => {
	const id = '{{id}}'

	const root = document.getElementById(id)

	const cardList = root.querySelector('.cards')
	const leftButton = root.querySelector('.leftButton')
	const rightButton = root.querySelector('.rightButton')
	cardList.classList.add('hidden-scrollbar')

	const cards = [...cardList.children]
	let page = 0

	leftButton.addEventListener('click', () => {
		if (page === 0) return
		page -= 1
		scrollToCard()
	})

	rightButton.addEventListener('click', () => {
		if (page + 1 >= cards.length) return
		page += 1
		scrollToCard()
	})

	function scrollToCard() {
		const card = page >= cards.length ? cards[cards.length - 1] : cards[page]
		card.scrollIntoView({
			behavior: 'smooth',
			block: 'start',
			inline: 'start',
		})
	}
})()
