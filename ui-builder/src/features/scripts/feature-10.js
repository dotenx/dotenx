/* eslint-disable no-undef */

;(async () => {
	const id = '{{id}}'

	const root = document.getElementById(id)

	const img = root.querySelector('.image')
	const subheadings = root.querySelectorAll('.subheading')

	subheadings.forEach((subheading) => {
		subheading.addEventListener('click', () => {
			img.src = subheading.querySelector('img').src
			subheading.style.borderLeftColor = '#000'
			subheadings.forEach((other) => {
				if (other !== subheading) {
					other.style.borderLeftColor = '#fff'
				}
			})
		})
	})

	subheadings[0].click()
})()
