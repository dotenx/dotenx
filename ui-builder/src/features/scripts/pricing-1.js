/* eslint-disable no-undef */

; (async () => {
	const id = '{{id}}'

	const root = document.getElementById(id)
	const monthlyWrappers = [...root.querySelectorAll('.monthly_wrapper')]
	const yearlyWrappers = [...root.querySelectorAll('.yearly_wrapper')]

	const monthly = root.querySelector('.monthly')
	const yearly = root.querySelector('.yearly')

	const activeId = root.querySelector('.monthly').id
	const inactiveId = root.querySelector('.yearly').id

	monthly.addEventListener('click', () => {
		yearlyWrappers.map(wrapper => {
			wrapper.style.display = 'none'
		})
		monthlyWrappers.map(wrapper => {
			wrapper.style.display = 'block'

		})
		if (monthly.classList.contains('active')) return
		monthly.classList.add('active')
		yearly.classList.remove('active')

		monthly.id = activeId
		yearly.id = inactiveId


	})
	yearly.addEventListener('click', () => {
		monthlyWrappers.map(wrapper => {
			wrapper.style.display = 'none'
		})
		yearlyWrappers.map(wrapper => {
			wrapper.style.display = 'block'
		})
		if (yearly.classList.contains('active')) return
		yearly.classList.add('active')
		monthly.classList.remove('active')

		yearly.id = activeId
		monthly.id = inactiveId


	})
})()
