import { ReactNode } from 'react'
import { TbChartBar } from 'react-icons/tb'
import { Style } from '../style'
import { Element, RenderFn, RenderOptions } from '../element'

import { Chart as ChartJS, RadialLinearScale, ArcElement, Tooltip, Legend } from 'chart.js'
import { PolarArea } from 'react-chartjs-2'

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend)

export const data = {
	labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
	datasets: [
		{
			label: '# of Votes',
			data: [12, 19, 3, 5, 2, 3],
			backgroundColor: [
				'rgba(255, 99, 132, 0.5)',
				'rgba(54, 162, 235, 0.5)',
				'rgba(255, 206, 86, 0.5)',
				'rgba(75, 192, 192, 0.5)',
				'rgba(153, 102, 255, 0.5)',
				'rgba(255, 159, 64, 0.5)',
			],
			borderWidth: 1,
		},
	],
}

export class PolarAreaChart extends Element {
	name = 'Polar Area'
	icon = (<TbChartBar />)
	data = {
		text: '', // todo: remove this. this is only to suppress the error
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
		return <PolarArea data={this.data.data} />
	}

	renderOptions({ set }: RenderOptions): ReactNode {
		return <div className="space-y-6"></div>
	}
}
