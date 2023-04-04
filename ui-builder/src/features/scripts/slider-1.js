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
		if ((page + 1) * cardsPerPage() >= cards.length) return
		page += 1
		scrollToCard()
	})

	function scrollToCard() {
		const card =
			page * cardsPerPage() >= cards.length
				? cards[cards.length - 1]
				: cards[page * cardsPerPage()]
		card.scrollIntoView({
			behavior: 'smooth',
			block: 'start',
			inline: 'start',
		})
	}

	function cardsPerPage() {
		// max width breakpoints: 767px 478px
		const width = window.innerWidth
		if (width > 767) return 3
		if (width > 478) return 2
		return 1
	}
})()
