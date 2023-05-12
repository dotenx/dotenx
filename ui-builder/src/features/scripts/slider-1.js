/* eslint-disable no-undef */

;(async () => {
	const id = '{{id}}'

	const root = document.getElementById(id)

	const list = root.querySelector('.list')
	const leftButton = root.querySelector('.leftButton')
	const rightButton = root.querySelector('.rightButton')
	list.classList.add('hidden-scrollbar')

	const items = [...list.children]
	let page = 0

	leftButton.addEventListener('click', () => {
		if (page === 0) return
		page -= 1
		scrollToItem()
	})

	rightButton.addEventListener('click', () => {
		if ((page + 1) * itemPerPage() >= items.length) return
		page += 1
		scrollToItem()
	})

	function scrollToItem() {
		const item =
			page * itemPerPage() >= items.length
				? items[items.length - 1]
				: items[page * itemPerPage()]
		item.scrollIntoView({
			behavior: 'smooth',
			block: 'start',
			inline: 'start',
		})
	}

	function itemPerPage() {
		// max width breakpoints: 767px 478px
		const width = window.innerWidth
		if (width > 767) return 3
		if (width > 478) return 2
		return 1
	}
})()
