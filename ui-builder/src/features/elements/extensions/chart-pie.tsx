import { ReactNode } from 'react'
import { TbChartBar } from 'react-icons/tb'
import { Element, RenderOptions } from '../element'
import { Style } from '../style'

import { ArcElement, Chart as ChartJS, ChartData, Legend, Tooltip } from 'chart.js'
import { Pie } from 'react-chartjs-2'
ChartJS.register(ArcElement, Tooltip, Legend)

import { ChartOptions, defaultAxisFrom, useGetAxisFrom } from './chart-bar'

export const data = {
	labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
	datasets: [
		{
			label: '# of Votes',
			data: [12, 19, 3, 5, 2, 3],
			backgroundColor: [
				'rgba(255, 99, 132, 0.2)',
				'rgba(54, 162, 235, 0.2)',
				'rgba(255, 206, 86, 0.2)',
				'rgba(75, 192, 192, 0.2)',
				'rgba(153, 102, 255, 0.2)',
				'rgba(255, 159, 64, 0.2)',
			],
			borderColor: [
				'rgba(255, 99, 132, 1)',
				'rgba(54, 162, 235, 1)',
				'rgba(255, 206, 86, 1)',
				'rgba(75, 192, 192, 1)',
				'rgba(153, 102, 255, 1)',
				'rgba(255, 159, 64, 1)',
			],
			borderWidth: 1,
		},
	],
}

export class PieChart extends Element {
	name = 'Pie'
	icon = (<TbChartBar />)
	data = {
		text: '', // todo: remove this. this is only to suppress the error
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
		return <Pie data={this.data.data} />
	}

	renderOptions({ set }: RenderOptions): ReactNode {
		return <ChartOptions element={this} set={set} />
	}

	renderPreview() {
		return <ChartPreview element={this} />
	}
}

function ChartPreview({ element }: { element: PieChart }) {
	const data = useGetAxisFrom(element) as ChartData<'pie'>
	return <Pie data={data} />
}
