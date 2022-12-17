import {
	CategoryScale,
	Chart as ChartJS,
	ChartData,
	Filler,
	Legend,
	LinearScale,
	LineElement,
	PointElement,
	Title,
	Tooltip,
} from 'chart.js'
import { ReactNode } from 'react'
import { Line } from 'react-chartjs-2'
import { TbChartBar } from 'react-icons/tb'
import { Element, RenderOptions } from '../element'
import { Style } from '../style'
import { AreaChart } from './chart-area'
import {
	ChartOptions,
	defaultAxisFrom,
	defaultChartData,
	defaultChartLabels,
	useGetAxisFrom,
} from './chart-bar'
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

const data = {
	labels: defaultChartLabels,
	datasets: [
		{
			fill: false, // This is the only difference from chart-area
			label: 'Dataset',
			data: defaultChartData,
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
			text: 'Line Chart',
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

export class LineChart extends Element {
	name = 'Line'
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
		return <Line options={this.data.options} data={this.data.data} />
	}

	renderOptions({ set }: RenderOptions): ReactNode {
		return <ChartOptions element={this} set={set} />
	}

	renderPreview() {
		return <ChartPreview element={this} />
	}
}

function ChartPreview({ element }: { element: AreaChart }) {
	const data = useGetAxisFrom(element) as ChartData<'line'>
	return <Line options={element.data.options} data={data} />
}
