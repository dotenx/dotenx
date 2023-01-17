import { Table } from "@mantine/core"
import _ from "lodash"
import { JsonMap } from "../../api"

export function ViewTable({ items }: { items: JsonMap[] }) {
	const headers = items.length > 0 ? _.keys(items[0]) : []

	const ths = (
		<tr>
			{headers.map((header) => (
				<th key={header}>{header}</th>
			))}
		</tr>
	)

	const rows = items.map((item, index) => (
		<tr key={index}>
			{_.toPairs(item).map(([key, value]) => (
				<td key={key}>{_.toString(value)}</td>
			))}
		</tr>
	))

	return (
		<Table striped highlightOnHover withBorder withColumnBorders>
			<thead>{ths}</thead>
			<tbody>{rows}</tbody>
		</Table>
	)
}
