import { ReactNode } from 'react'
import { TbChartBar } from 'react-icons/tb'
import { Style } from '../style'
// import faker from "faker";
import { Element, RenderFn, RenderOptions } from '../element'

import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);


import { TextInput } from '@mantine/core'
import produce from 'immer'


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
        text: 'Month'
      }
    },
		y: {
			beginAtZero: true,
      title: {
        display: true,
        text: 'Value'
      }
    }
	},
};

export const data = {
  datasets: [
    {
      label: 'A dataset',
      data: Array.from({ length: 100 }, () => ({
        x: Math.ceil(Math.random() * 200 - 100),
        y: Math.ceil(Math.random() * 200 - 100),
      })),
      backgroundColor: 'rgba(255, 99, 132, 1)',
    },
  ],
};

export class ScatterChart extends Element {
	name = 'Scatter'
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
		return <Scatter options={this.data.options} data={this.data.data} />
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
