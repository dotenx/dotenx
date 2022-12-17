import {
	Chart as ChartJS,
	ChartData,
	Filler,
	Legend,
	LineElement,
	PointElement,
	RadialLinearScale,
	Tooltip,
} from 'chart.js'
import { ReactNode } from 'react'
import { Radar } from 'react-chartjs-2'
import { TbChartBar } from 'react-icons/tb'
import { Element, RenderOptions } from '../element'
import { Style } from '../style'
import { ChartOptions, defaultAxisFrom, useGetAxisFrom } from './chart-bar'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const data = {
	labels: ['Thing 1', 'Thing 2', 'Thing 3', 'Thing 4', 'Thing 5', 'Thing 6'],
	datasets: [
		{
			label: '# of Votes',
			data: [2, 9, 3, 5, 2, 3],
			backgroundColor: 'rgba(255, 99, 132, 0.2)',
			borderColor: 'rgba(255, 99, 132, 1)',
			borderWidth: 1,
		},
	],
}

export class RadarChart extends Element {
	name = 'Radar'
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
		return <Radar data={this.data.data} />
	}

	renderOptions({ set }: RenderOptions): ReactNode {
		return <ChartOptions element={this} set={set} />
	}

	renderPreview() {
		return <ChartPreview element={this} />
	}
}

function ChartPreview({ element }: { element: RadarChart }) {
	const data = useGetAxisFrom(element) as ChartData<'radar'>
	return <Radar data={data} />
}
