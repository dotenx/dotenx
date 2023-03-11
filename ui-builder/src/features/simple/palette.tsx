import { Button, ColorSwatch, Divider } from '@mantine/core'
import { atom, useAtom } from 'jotai'

const palettes: ColorPalette[] = [
	{
		id: 'aec7ff86-cd5c-4cdd-9745-25988cea8318',
		colors: ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51'],
	},
	{
		id: '133049dd-ce11-44a9-a507-5cf547085d27',
		colors: ['#e63946', '#f1faee', '#a8dadc', '#457b9d', '#1d3557'],
	},
]

type ColorPalette = {
	id: string
	colors: string[]
}

export function Palette() {
	const [selectedPalette, selectPalette] = useAtom(selectedPaletteAtom)

	return (
		<div>
			<Divider label="Color palette" />
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
							{palette.id === selectedPalette.id ? 'Selected' : 'Select'}
						</Button>
					</div>
				))}
			</div>
		</div>
	)
}

export const color = (color: Color, opacity = 1) => `rgba(var(--${color}) / ${opacity})`

export const colorNames = ['primary', 'secondary', 'tertiary', 'quaternary', 'quinary'] as const

type Color = (typeof colorNames)[number]

export const selectedPaletteAtom = atom<ColorPalette>(palettes[0])
