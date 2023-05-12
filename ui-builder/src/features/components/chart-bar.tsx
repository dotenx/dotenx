import { ColorInput, Select } from '@mantine/core'
import { useInputState } from '@mantine/hooks'
import produce from 'immer'
import { useAtomValue } from 'jotai'
import { ReactNode } from 'react'
import { API_URL } from '../../api'
import areaChartImg from '../../assets/components/area-chart.png'
import barChartImg from '../../assets/components/bar-chart.png'
import bubbleChartImg from '../../assets/components/bubble-chart.png'
import doughnutChartImg from '../../assets/components/doughnut-chart.png'
import lineChartImg from '../../assets/components/line-chart.png'
import pieChartImg from '../../assets/components/pie-chart.png'
import polarAreaChartImg from '../../assets/components/polar-area-chart.png'
import radarChartImg from '../../assets/components/radar-chart.png'
import scatterChartImg from '../../assets/components/scatter-chart.png'
import { deserializeElement } from '../../utils/deserialize'
import { useAddDataSource } from '../data-source/data-source-form'
import { HttpMethod } from '../data-source/data-source-store'
import { AreaChart } from '../elements/extensions/chart-area'
import { BarChart } from '../elements/extensions/chart-bar'
import { BubbleChart } from '../elements/extensions/chart-bubble'
import { DoughnutChart } from '../elements/extensions/chart-doughnut'
import { LineChart } from '../elements/extensions/chart-line'
import { PieChart } from '../elements/extensions/chart-pie'
import { PolarAreaChart } from '../elements/extensions/chart-polar-area'
import { RadarChart } from '../elements/extensions/chart-radar'
import { ScatterChart } from '../elements/extensions/chart-scatter'
import { projectTagAtom } from '../page/top-bar'
import { Expression } from '../states/expression'
import { inteliText } from '../ui/intelinput'
import { Component, ElementOptions } from './component'
import { TableSelect, useColumnsQuery } from './create-form'
import { ComponentName } from './helpers'

export class ChartBar extends Component {
	name = 'Bar chart'
	image = barChartImg
	defaultData = deserializeElement(defaultData)
	data: { tableName: string | null } = { tableName: null }

	renderOptions(options: ElementOptions): ReactNode {
		return <ChartBarOptions options={options} component={this} />
	}
}

// =============  renderOptions =============

function ChartBarOptions({ options, component }: { options: ElementOptions; component: ChartBar }) {
	const element = options.element as BarChart
	const [selectedTable, setSelectedTable] = useInputState(component.data.tableName)

	const projectTag = useAtomValue(projectTagAtom)
	const { addDataSource } = useAddDataSource({ mode: 'add' })
	const dataSourceName = `${options.element.id}_data`
	const columnsQuery = useColumnsQuery({
		tableName: selectedTable,
		onSuccess: () => {
			if (!selectedTable) return
			addDataSource({
				isPrivate: true,
				body: Expression.fromString(JSON.stringify({ columns: [] })),
				fetchOnload: true,
				headers: '',
				method: HttpMethod.Post,
				stateName: dataSourceName,
				url: inteliText(
					`${API_URL}/database/query/select/project/${projectTag}/table/${selectedTable}`
				),
			})
			component.data.tableName = selectedTable
		},
	})

	const columns = columnsQuery.data?.data.columns.map((col) => col.name) ?? []

	return (
		<div className="space-y-6">
			<ComponentName name="Bar chart" />
			<TableSelect
				description="Table which you want to get data from"
				value={selectedTable}
				onChange={setSelectedTable}
			/>
			<Select
				disabled={!selectedTable}
				size="xs"
				label="Labels"
				description="Get title from"
				data={columns}
				value={element.data.axisFrom.x.propName}
				onChange={(value) => {
					options.set(
						produce(element, (draft) => {
							draft.data.axisFrom.x = {
								listName: `${dataSourceName}.rows`,
								propName: value ?? '',
							}
						})
					)
				}}
			/>

			<Select
				disabled={!selectedTable}
				size="xs"
				label="Data"
				description="Get name from"
				data={columns}
				value={element.data.axisFrom.y.propName}
				onChange={(value) => {
					options.set(
						produce(element, (draft) => {
							draft.data.axisFrom.y = {
								listName: `${dataSourceName}.rows`,
								propName: value ?? '',
							}
						})
					)
				}}
			/>
			<ColorInput
				value={element.data.data.datasets?.[0].backgroundColor}
				label={'Bar color'}
				onChange={(value: any) => {
					options.set(
						produce(element, (draft) => {
							draft.data.data.datasets[0].backgroundColor = value
						})
					)
				}}
				className="col-span-9"
				size="xs"
				format="hsla"
			/>
		</div>
	)
}

// =============  defaultData =============

const chart = new BarChart().serialize()

const defaultData = chart

export class ChartArea extends ChartBar {
	name = 'Area chart'
	image = areaChartImg
	defaultData = deserializeElement(new AreaChart().serialize())
}

export class ChartBubble extends ChartBar {
	name = 'Bubble chart'
	image = bubbleChartImg
	defaultData = deserializeElement(new BubbleChart().serialize())
}

export class ChartDoughnut extends ChartBar {
	name = 'Doughnut chart'
	image = doughnutChartImg
	defaultData = deserializeElement(new DoughnutChart().serialize())
}

export class ChartLine extends ChartBar {
	name = 'Line chart'
	image = lineChartImg
	defaultData = deserializeElement(new LineChart().serialize())
}

export class ChartPie extends ChartBar {
	name = 'Pie chart'
	image = pieChartImg
	defaultData = deserializeElement(new PieChart().serialize())
}

export class ChartPolarArea extends ChartBar {
	name = 'PolarArea chart'
	image = polarAreaChartImg
	defaultData = deserializeElement(new PolarAreaChart().serialize())
}

export class ChartRadar extends ChartBar {
	name = 'Radar chart'
	image = radarChartImg
	defaultData = deserializeElement(new RadarChart().serialize())
}

export class ChartScatter extends ChartBar {
	name = 'Scatter chart'
	image = scatterChartImg
	defaultData = deserializeElement(new ScatterChart().serialize())
}
