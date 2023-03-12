import { Button, ColorSwatch, Divider } from '@mantine/core'
import { atom, useAtom } from 'jotai'
import { z } from 'zod'

const palettes: ColorPalette[] = [
	{
		id: 'aec7ff86-cd5c-4cdd-9745-25988cea8318',
		colors: ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51'],
	},
	{
		id: '133049dd-ce11-44a9-a507-5cf547085d27',
		colors: ['#e63946', '#f1faee', '#a8dadc', '#457b9d', '#1d3557'],
	},
	{
		id: '0cbb5062-ff20-469a-ad83-209e68cca2e0',
		colors: ['#606c38', '#283618', '#fefae0', '#dda15e', '#bc6c25'],
	},
	{
		id: '580d000b-1b72-4dcc-b906-c0db4e1a7d81',
		colors: ['#8ecae6', '#219ebc', '#023047', '#ffb703', '#fb8500'],
	},
	{
		id: '6c942f16-4539-4263-9ede-d834586ff281',
		colors: ['#003049', '#d62828', '#f77f00', '#fcbf49', '#eae2b7'],
	},
]

type ColorPalette = {
	id: string
	colors: [string, string, string, string, string]
}

export function Palette() {
	const [selectedPalette, selectPalette] = useAtom(selectedPaletteAtom)

	return (
		<div>
			<Divider label="Color palette" mb="xl" />
			<div className="space-y-6">
				{palettes.map((palette) => (
					<div key={palette.id} className="flex justify-between items-center">
						<div className="flex gap-2">
							{palette.colors.map((color) => (
								<ColorSwatch key={color} color={color} />
							))}
						</div>
						<Button
							variant="default"
							size="xs"
							onClick={() => selectPalette(palette)}
							disabled={palette.id === selectedPalette.id}
						>
							{palette.id === selectedPalette.id ? 'Active' : 'Select'}
						</Button>
					</div>
				))}
			</div>
		</div>
	)
}

export const color = (color: Color, opacity = 1) => `rgba(var(--${color}) / ${opacity})`

export const colorNames = ['primary', 'secondary', 'accent', 'background', 'text'] as const

export const colorNamesSchema = z.enum(colorNames)

export type Color = (typeof colorNames)[number]

export const selectedPaletteAtom = atom<ColorPalette>(palettes[0])
