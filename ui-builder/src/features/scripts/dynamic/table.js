/* eslint-disable no-undef */

;(async () => {
	const id = '{{id}}'
	const projectTag = '{{projectTag}}'
	const tableName = '{{tableName}}'

	const root = document.getElementById(id)
	const table = root.querySelector('.table')
	const rows = root.querySelectorAll('.row')
	const rowTemplate = root.querySelector('.row')
	const head = root.querySelector('.head')

	head.innerHTML = ''
	rows.forEach((row) => row.remove())

	const data = await fetch(
		`https://api.dotenx.com/public/database/query/select/project/${projectTag}/table/${tableName}`,
		{
			body: JSON.stringify({ columns: [] }),
			method: 'POST',
		}
	).then((res) => res.json())

	head.style.gridTemplateColumns = `repeat(${Object.keys(data.rows[0]).length - 1}, 1fr)`
	Object.keys(data.rows[0]).forEach((column) => {
		if (column === 'creator_id') return
		const cell = document.createElement('div')
		cell.textContent = column
		head.appendChild(cell)
	})

	data.rows.forEach((row) => {
		const cells = rowTemplate.cloneNode(true)
		cells.innerHTML = ''
		cells.style.gridTemplateColumns = `repeat(${Object.keys(row).length - 1}, 1fr)`
		Object.keys(row).forEach((column) => {
			if (column === 'creator_id') return
			const cell = document.createElement('div')
			cell.textContent = row[column]
			cells.appendChild(cell)
		})
		table.appendChild(cells)
	})
})()
