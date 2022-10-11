import { BoxElement } from './extensions/box'
import { ButtonElement } from './extensions/button'
import { AreaChart } from './extensions/chart-area'
import { BarChart } from './extensions/chart-bar'
import { BubbleChart } from './extensions/chart-bubble'
import { DoughnutChart } from './extensions/chart-doughnut'
import { HorizontalBarChart } from './extensions/chart-horizontal-bar'
import { LineChart } from './extensions/chart-line'
import { PieChart } from './extensions/chart-pie'
import { PolarAreaChart } from './extensions/chart-polar-area'
import { RadarChart } from './extensions/chart-radar'
import { ScatterChart } from './extensions/chart-scatter'
import { ColumnsElement } from './extensions/columns'
import { DividerElement } from './extensions/divider'
import { FormElement } from './extensions/form'
import { IconElement } from './extensions/icon'
import { ImageElement } from './extensions/image'
import { InputElement } from './extensions/input'
import { LinkElement } from './extensions/link'
import { MenuButtonElement } from './extensions/nav/menu-button'
import { NavLinkElement } from './extensions/nav/nav-link'
import { NavMenuElement } from './extensions/nav/nav-menu'
import { NavbarElement } from './extensions/nav/navbar'
import { SelectElement } from './extensions/select'
import { SliderElement } from './extensions/slider'
import { StackElement } from './extensions/stack'
import { SubmitElement } from './extensions/submit'
import { TextElement } from './extensions/text'
import { TextareaElement } from './extensions/textarea'
import './fa-import'

export const ElementSections = [
	{
		title: 'Basic',
		items: [
			TextElement,
			ButtonElement,
			ImageElement,
			LinkElement,
			DividerElement,
			BoxElement,
			ColumnsElement,
			StackElement,
			NavbarElement,
			IconElement,
		],
	},
	{
		title: 'Compound',
		items: [NavbarElement, SliderElement],
	},
	{
		title: 'Form',
		items: [FormElement, InputElement, SelectElement, TextareaElement, SubmitElement],
	},
	{
		title: 'Charts',
		items: [
			BarChart,
			HorizontalBarChart,
			AreaChart,
			LineChart,
			PieChart,
			DoughnutChart,
			PolarAreaChart,
			RadarChart,
			ScatterChart,
			BubbleChart,
		],
	},
] as const

export const ELEMENTS = ElementSections.flatMap((element) => element.items).concat([
	MenuButtonElement,
	NavLinkElement,
	NavMenuElement,
])
