/* eslint-disable no-undef */

;(async () => {
	const id = '{{id}}'

	const root = document.getElementById(id)
	const items = root.querySelectorAll('.item')

	items.forEach((item) => {
		const question = item.querySelector('.question')
		const answer = item.querySelector('.answer')
		const chevron = item.querySelector('.chevron')
		answer.style.display = 'none'
		question.addEventListener('click', () => {
			const isHidden = answer.style.display === 'none'
			answer.style.display = isHidden ? 'block' : 'none'
			chevron.style.rotate = isHidden ? '180deg' : '0deg'
		})
	})
})()
