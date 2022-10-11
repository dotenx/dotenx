import { ReactNode } from 'react'
import { TbChartBar } from 'react-icons/tb'
import { Style } from '../style'
import { Element, RenderFn, RenderOptions } from '../element'

import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Filler,
	Legend,
} from 'chart.js'

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Filler,
	Legend
)

import { Line } from 'react-chartjs-2'
import { TextInput } from '@mantine/core'
import produce from 'immer'

const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July']

const data = {
	labels,
	datasets: [
		{
			fill: true,
			label: 'Dataset',
			data: labels.map(() => Math.ceil(Math.random() * 1000)),
			borderColor: 'rgb(53, 162, 235)',
			backgroundColor: 'rgba(53, 162, 235, 0.5)',
		},
	],
}
const options = {
	responsive: true,
	plugins: {
		legend: {
			display: false,
		},
		title: {
			display: true,
			text: 'Area Chart',
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

export class AreaChart extends Element {
	name = 'Area'
	icon = (<TbChartBar />)
	data = { options, data }
	style: Style = {
		desktop: {
			default: {
				width: '100%',
			},
		},
	}

	render(): ReactNode {
		return <Line options={this.data.options} data={this.data.data} />
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
