import { ReactNode } from 'react'
import { TbChartBar } from 'react-icons/tb'
import { Element, RenderOptions, Setter } from '../element'
import { Style } from '../style'

import {
	BarElement,
	CategoryScale,
	Chart as ChartJS,
	ChartData,
	Legend,
	LinearScale,
	Title,
	Tooltip,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

import { Switch, TextInput } from '@mantine/core'
import { produce } from 'immer'
import _ from 'lodash'
import { Bar } from 'react-chartjs-2'
import { JsonArray } from '../../../utils'
import { Expression, StateValue } from '../../states/expression'
import { usePageStateStore } from '../../states/page-states-store'
import { useDataSourceStates } from '../../states/use-get-states'
import { Intelinput } from '../../ui/intelinput'

export const defaultChartLabels = ['January', 'February', 'March', 'April', 'May', 'June', 'July']
export const defaultChartData = defaultChartLabels.map(() => Math.ceil(Math.random() * 1000))

const data = {
	labels: defaultChartLabels,
	datasets: [
		{
			label: 'Dataset',
			data: defaultChartData,
			backgroundColor: 'rgba(255, 99, 132, 0.5)',
		},
	],
}
const options = {
	indexAxis: 'x' as 'x' | 'y',
	responsive: true,
	plugins: {
		legend: {
			display: false,
		},
		title: {
			display: true,
			text: 'Bar Chart',
		},
	},
	scales: {
		x: {
			title: {
				display: true,
				text: 'Month',
			},
		},
		y: {
			title: {
				display: true,
				text: 'Value',
			},
		},
	},
}

export const defaultAxisFrom = {
	x: {
		listName: '',
		propName: '',
	},
	y: {
		listName: '',
		propName: '',
	},
}

export class BarChart extends Element {
	name = 'Bar'
	icon = (<TbChartBar />)
	data = {
		text: '', // todo: remove this. this is only to suppress the error
		options,
		data,
		axisFrom: defaultAxisFrom,
	}
	style: Style = {
		desktop: {
			default: {
				width: '100%',
			},
		},
	}

	render(): ReactNode {
		return <Bar options={this.data.options} data={this.data.data} />
	}

	renderPreview() {
		return <ChartPreview element={this} />
	}

	renderOptions({ set }: RenderOptions): ReactNode {
		return <ChartOptions element={this} set={set} />
	}
}

type AxisFrom = typeof defaultAxisFrom

export const useGetAxisFrom = (element: ChartElement) => {
	const pageStates = usePageStateStore((store) => store.states)
	if (!(element.data.axisFrom.x.listName || element.data.axisFrom.y.listName)) return element.data
	const list = _.get(pageStates, element.data.axisFrom.x.listName) as JsonArray
	const xData = list.map((item) => _.get(item, element.data.axisFrom.x.propName) as string)
	const yData = list.map((item) => _.get(item, element.data.axisFrom.y.propName) as number)
	const data = produce(element.data.data, (draft) => {
		draft.labels = xData
		draft.datasets[0].data = yData
	})
	return data
}

function ChartPreview({ element }: { element: BarChart }) {
	const data = useGetAxisFrom(element) as ChartData<'bar'>
	return <Bar options={element.data.options} data={data} />
}

interface ChartElement extends Element {
	data: {
		options?: {
			indexAxis?: 'x' | 'y'
			plugins: { title: { text: string } }
			scales: { x: { title: { text: string } }; y: { title: { text: string } } }
		}
		axisFrom: AxisFrom
		data: ChartData
	}
}

export function ChartOptions({ element, set }: { element: ChartElement; set: Setter }) {
	const axisesData = (
		<div className="space-y-6">
			<SingleIntelinput
				label="Labels"
				value={element.data.axisFrom.x}
				onChange={(value) =>
					set(
						produce(element, (draft) => {
							draft.data.axisFrom.x = value
						})
					)
				}
			/>
			<SingleIntelinput
				label="Data"
				value={element.data.axisFrom.y}
				onChange={(value) =>
					set(
						produce(element, (draft) => {
							draft.data.axisFrom.y = value
						})
					)
				}
			/>
		</div>
	)

	if (!element.data.options) return axisesData

	return (
		<div className="space-y-6">
			<Switch
				size="xs"
				label="Horizontal"
				checked={element.data.options.indexAxis === 'y'}
				onChange={(event) =>
					set(
						produce(element, (draft) => {
							_.set(draft, 'data.options.indexAxis', event.target.checked ? 'y' : 'x')
						})
					)
				}
			/>
			<TextInput
				label="Title"
				size="xs"
				value={element.data.options.plugins.title.text}
				onChange={(event) =>
					set(
						produce(element, (draft) => {
							_.set(draft, 'data.options.plugins.title.text', event.target.value)
						})
					)
				}
			/>
			<TextInput
				label="X-axis title"
				size="xs"
				value={element.data.options.scales.x.title.text}
				onChange={(event) =>
					set(
						produce(element, (draft) => {
							_.set(draft, 'data.options.scales.x.title.text', event.target.value)
						})
					)
				}
			/>
			<TextInput
				label="Y-axis title"
				size="xs"
				value={element.data.options.scales.y.title.text}
				onChange={(event) =>
					set(
						produce(element, (draft) => {
							_.set(draft, 'data.options.scales.y.title.text', event.target.value)
						})
					)
				}
			/>
			{axisesData}
		</div>
	)
}

function SingleIntelinput({
	label,
	value,
	onChange,
}: {
	label: string
	value: { listName: string; propName: string }
	onChange: (value: { listName: string; propName: string }) => void
}) {
	const states = useDataSourceStates()
	const inputValue = `${value.listName}[].${value.propName}`

	return (
		<Intelinput
			label={label}
			value={value.listName ? Expression.fromState(inputValue) : new Expression()}
			onChange={(value) => {
				if (_.isEmpty(value.value)) {
					onChange({ listName: '', propName: '' })
				} else {
					const [listName, propName] = (value.value[0] as StateValue).value.split('[].')
					onChange({ listName, propName })
				}
			}}
			options={states}
		/>
	)
}
