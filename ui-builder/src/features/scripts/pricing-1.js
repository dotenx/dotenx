/* eslint-disable no-undef */

; (async () => {
	const id = '{{id}}'

	const root = document.getElementById(id)
	const monthlyWrappers = [...root.querySelectorAll('.monthly_wrapper')]
	const yearlyWrappers = [...root.querySelectorAll('.yearly_wrapper')]

	const monthly = root.querySelector('.monthly')
	const yearly = root.querySelector('.yearly')

	monthly.addEventListener('click', () => {
		const activeStyle = getComputedStyle(yearly)
		const inactiveStyle = getComputedStyle(monthly)

		monthly.style.backgroundColor = activeStyle.backgroundColor
		yearly.style.backgroundColor = inactiveStyle.backgroundColor
		console.log(activeStyle.backgroundColor, 'monthly')
		yearlyWrappers.map(wrapper => {
			wrapper.style.display = 'none'
		})
		monthlyWrappers.map(wrapper => {
			wrapper.style.display = 'block'

		})
	})
	yearly.addEventListener('click', () => {
		const activeStyle = getComputedStyle(monthly)
		const inactiveStyle = getComputedStyle(yearly)
		console.log(activeStyle.backgroundColor, 'yearly')
		yearly.style.backgroundColor = activeStyle.backgroundColor
		monthly.style.backgroundColor = inactiveStyle.backgroundColor
		monthlyWrappers.map(wrapper => {
			wrapper.style.display = 'none'
		})
		yearlyWrappers.map(wrapper => {
			wrapper.style.display = 'block'
		})
	})
})()
