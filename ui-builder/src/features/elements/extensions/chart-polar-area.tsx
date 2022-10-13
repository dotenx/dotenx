import { ReactNode } from 'react'
import { TbChartBar } from 'react-icons/tb'
import { Element, RenderOptions } from '../element'
import { Style } from '../style'

import {
	ArcElement,
	Chart as ChartJS,
	ChartData,
	Legend,
	RadialLinearScale,
	Tooltip,
} from 'chart.js'
import { PolarArea } from 'react-chartjs-2'
import { ChartOptions, defaultAxisFrom, useGetAxisFrom } from './chart-bar'

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
		return <PolarArea data={this.data.data} />
	}

	renderOptions({ set }: RenderOptions): ReactNode {
		return <ChartOptions element={this} set={set} />
	}

	renderPreview() {
		return <ChartPreview element={this} />
	}
}

function ChartPreview({ element }: { element: PolarAreaChart }) {
	const data = useGetAxisFrom(element) as ChartData<'polarArea'>
	return <PolarArea data={data} />
}
