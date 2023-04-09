/* eslint-disable no-undef */

;(async () => {
	const id = '{{id}}'
	const cardsPerPage = JSON.parse('{{cardsPerPage}}')

	const root = document.getElementById(id)

	const cardList = root.querySelector('.cards')
	const leftButton = root.querySelector('.leftButton')
	const rightButton = root.querySelector('.rightButton')
	cardList.classList.add('hidden-scrollbar')
	const cards = [...cardList.children]

	const activeButton = root.querySelector('.pagination .active')
	const inactiveButton = root.querySelector('.pagination .inactive')
	
	const activeColor = getComputedStyle(activeButton).backgroundColor
	const inactiveColor = getComputedStyle(inactiveButton).backgroundColor
	activeButton.remove()
	inactiveButton.remove()

	// add inactive pagination buttons as many as cards.length / cardsPerPage - 1
	const pagination = root.querySelector('.pagination')
	pagination.appendChild(activeButton.cloneNode(true))
	for (let i = 0; i < Math.ceil(cards.length / calcCardsPerPage()) - 1; i++) {
		const button = inactiveButton.cloneNode(true)
		pagination.appendChild(button)
	}


	const paginationButtons = [...root.querySelectorAll('.pagination button')]
	let scrollWithButton = false
	paginationButtons.forEach((button, index) => {
		button.addEventListener('click', () => {
			page = index
			scrollToCard()
			setActiveButton(page)
		})
	})

	let page = 0

	leftButton?.addEventListener('click', () => {
		if (page === 0) return
		page -= 1
		scrollToCard()
	})

	rightButton?.addEventListener('click', () => {
		if ((page + 1) * calcCardsPerPage() >= cards.length) return
		page += 1
		scrollToCard()
	})

	function scrollToCard() {
		scrollWithButton = true
		const card =
			page * calcCardsPerPage() >= cards.length
				? cards[cards.length - 1]
				: cards[page * calcCardsPerPage()]
		card.scrollIntoView({
			behavior: 'smooth',
			block: 'start',
			inline: 'start',
		})

		// We use a timeout to prevent the scroll event from activating the buttons while the scroll is still happening
		setTimeout(() => {
			scrollWithButton = false
		}, 500)
	}

	function calcCardsPerPage() {
		const width = window.innerWidth
		if (width > 767) return cardsPerPage.desktop
		if (width > 478) return cardsPerPage.tablet
		return cardsPerPage.mobile
	}

	function setActiveButton(page) {
		paginationButtons.forEach((button, index) => {
			if (index === page) {
				button.style.backgroundColor = activeColor
			} else {
				button.style.backgroundColor = inactiveColor
			}
		})
	}

	/* Activate the pagination button on scroll. If the scroll is done with the buttons, don't activate the button */
	let scrollTimeout
	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				console.log(scrollWithButton)
				if (scrollWithButton) return
				if (entry.isIntersecting) {
					const card = entry.target
					const index = cards.indexOf(card)
					page = Math.floor(index / calcCardsPerPage())
						setActiveButton(page)
				}
			})
		},
		{
			root: cardList,
			rootMargin: '0px',
			threshold: 0.5,
		}
	)

	cards.forEach((card) => {
		observer.observe(card)
	})

})()
