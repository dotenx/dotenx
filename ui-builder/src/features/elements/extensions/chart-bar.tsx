import { ReactNode } from 'react'
import { TbChartBar } from 'react-icons/tb'
import { Style } from '../style'
// import faker from "faker";
import { Element, RenderFn, RenderOptions } from '../element'

import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

import { Bar } from 'react-chartjs-2'
import { TextInput } from '@mantine/core'
import produce from 'immer'

const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July']

const data = {
	labels,
	datasets: [
		{
			label: 'Dataset',
			data: labels.map(() => Math.ceil(Math.random() * 1000)),
			backgroundColor: 'rgba(255, 99, 132, 0.5)',
		},
	],
}
const options = {
	indexAxis: 'x' as const,
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

export class BarChart extends Element {
	name = 'Bar'
	icon = (<TbChartBar />)
	data = {
		text: '', // todo: remove this. this is only to suppress the error
		options,
		data,
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

	renderOptions({ set }: RenderOptions): ReactNode {
		return (
			<div className="space-y-6">
				<TextInput
					label="Title"
					size="xs"
					value={this.data.options.plugins.title.text}
					onChange={(event) =>
						set(
							produce(this, (draft) => {
								draft.data.options.plugins.title.text = event.target.value
							})
						)
					}
				/>
				<TextInput
					label="X-axis title"
					size="xs"
					value={this.data.options.scales.x.title.text}
					onChange={(event) =>
						set(
							produce(this, (draft) => {
								draft.data.options.scales.x.title.text = event.target.value
							})
						)
					}
				/>
				<TextInput
					label="Y-axis title"
					size="xs"
					value={this.data.options.scales.y.title.text}
					onChange={(event) =>
						set(
							produce(this, (draft) => {
								draft.data.options.scales.y.title.text = event.target.value
							})
						)
					}
				/>
			</div>
		)
	}
}
