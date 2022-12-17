export const animateCSS = (element: string, animation: string, prefix = 'animate__') =>
	// We create a Promise and return it
	new Promise((resolve, reject) => {
		const animationName = `${prefix}${animation}`
		const node = window.frames[0].document.querySelector(element)
		if (!node) return console.error('No element found for animation')

		node.classList.add(`${prefix}animated`, animationName)

		// When the animation ends, we clean the classes and resolve the Promise
		function handleAnimationEnd(event: Event) {
			event.stopPropagation()
			if (!node) return console.error('No element found for animation')
			node.classList.remove(`${prefix}animated`, animationName)
			resolve('Animation ended')
		}

		node.addEventListener('animationend', handleAnimationEnd, { once: true })
	})
