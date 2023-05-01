/* eslint-disable no-undef */

;(async () => {
	const id = '{{id}}'

	const root = document.getElementById(id)
	const list = root.querySelector('.list')
	const dots = root.querySelector('.dots')
	const prevBtn = root.querySelector('.prev')
	const nextBtn = root.querySelector('.next')

	list.style.overflowX = 'hidden'

	const listLength = list.children.length
	let scrolledIndex = 0
	prevBtn.addEventListener('click', prev)
	nextBtn.addEventListener('click', next)

	const dotItems = [...dots.children]
	dotItems.forEach((item, index) => {
		item.addEventListener('click', () => {
			scrolledIndex = index
			highlightDot()
			updatePositions()
		})
	})

	highlightDot()

	function prev() {
		if (scrolledIndex === 0) {
			scrolledIndex = listLength - 1
		} else {
			scrolledIndex -= 1
		}
		highlightDot()
		updatePositions()
	}

	function next() {
		if (scrolledIndex === listLength - 1) {
			scrolledIndex = 0
		} else {
			scrolledIndex += 1
		}
		highlightDot()
		updatePositions()
	}

	function highlightDot() {
		;[...dots.children].forEach((child) => (child.style.backgroundColor = '#22222266'))
		dots.children[scrolledIndex].style.backgroundColor = '#222222'
	}

	function updatePositions() {
		const items = [...list.children]
		items.forEach((item) => {
			item.style.transform = `translateX(-${scrolledIndex * item.clientWidth}px)`
		})
	}
})()
