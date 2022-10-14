import { Chart as ChartJS, ChartData, Legend, LinearScale, PointElement, Tooltip } from 'chart.js'
import { ReactNode } from 'react'
import { Bubble } from 'react-chartjs-2'
import { TbChartBar } from 'react-icons/tb'
import { Element, RenderOptions } from '../element'
import { Style } from '../style'
import { ChartOptions, defaultAxisFrom, useGetAxisFrom } from './chart-bar'

ChartJS.register(LinearScale, PointElement, Tooltip, Legend)

export const options = {
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
			beginAtZero: true,
			title: {
				display: true,
				text: 'Value',
			},
		},
	},
}

export const data = {
	datasets: [
		{
			label: 'A dataset',
			data: Array.from({ length: 100 }, () => ({
				x: Math.ceil(Math.random() * 200 - 100),
				y: Math.ceil(Math.random() * 200 - 100),
				r: Math.ceil(Math.random() * 10 - 5),
			})),
			backgroundColor: 'rgba(255, 99, 132, 1)',
		},
	],
}

export class BubbleChart extends Element {
	name = 'Bubble'
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
		return <Bubble options={this.data.options} data={this.data.data} />
	}

	renderOptions({ set }: RenderOptions): ReactNode {
		return <ChartOptions element={this} set={set} />
	}

	renderPreview() {
		return <ChartPreview element={this} />
	}
}

function ChartPreview({ element }: { element: BubbleChart }) {
	const data = useGetAxisFrom(element) as ChartData<'bubble'>
	return <Bubble options={element.data.options} data={data} />
}
