/* eslint-disable no-undef */

; (async () => {
	const id = '{{id}}'

	const root = document.getElementById(id)

	const headers = [...root.querySelectorAll('thead th p')]
  
  const rows = [...root.querySelectorAll('tbody tr')]
  rows.map((r) => {
    [...r.querySelectorAll('td')].map((td, i) => {
      const header = headers[i]
      const clone = header.cloneNode(true)
      td.replaceChild(clone, td.firstChild)
    })
  })
})()
