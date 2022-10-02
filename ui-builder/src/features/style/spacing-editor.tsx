import { Text } from '@mantine/core'
import { CollapseLine } from '../ui/collapse-line'
import { MarginPaddingInput } from '../ui/style-input'
import { useEditStyle } from './use-edit-style'

export function SpacingEditor() {
	const { style: styles, editStyle } = useEditStyle()

	return (
		<CollapseLine label="Spacing">
			<div className="relative flex flex-col gap-2 px-2 py-2 font-mono border rounded">
				<Text
					className="absolute uppercase top-1 left-2"
					color="dimmed"
					size={8}
					weight="bold"
				>
					Margin
				</Text>
				<MarginPaddingInput
					value={styles.marginTop?.toString() ?? '0px'}
					onChange={(value) => editStyle('marginTop', value)}
				/>
				<div className="flex gap-2">
					<MarginPaddingInput
						value={styles.marginLeft?.toString() ?? '0px'}
						onChange={(value) => editStyle('marginLeft', value)}
					/>
					<div className="px-1 py-1 bg-gray-200 border rounded grow">
						<div className="relative flex flex-col gap-2 px-2 py-2 bg-white border rounded">
							<Text
								className="absolute uppercase top-1 left-2"
								color="dimmed"
								size={8}
								weight="bold"
							>
								Padding
							</Text>
							<MarginPaddingInput
								value={styles.paddingTop?.toString() ?? '0px'}
								onChange={(value) => editStyle('paddingTop', value)}
							/>
							<div className="flex items-center gap-2">
								<MarginPaddingInput
									value={styles.paddingLeft?.toString() ?? '0px'}
									onChange={(value) => editStyle('paddingLeft', value)}
								/>
								<div className="h-4 bg-gray-200 border rounded grow" />
								<MarginPaddingInput
									value={styles.paddingRight?.toString() ?? '0px'}
									onChange={(value) => editStyle('paddingRight', value)}
								/>
							</div>
							<MarginPaddingInput
								value={styles.paddingBottom?.toString() ?? '0px'}
								onChange={(value) => editStyle('paddingBottom', value)}
							/>
						</div>
					</div>
					<MarginPaddingInput
						value={styles.marginRight?.toString() ?? '0px'}
						onChange={(value) => editStyle('marginRight', value)}
					/>
				</div>
				<MarginPaddingInput
					value={styles.marginBottom?.toString() ?? '0px'}
					onChange={(value) => editStyle('marginBottom', value)}
				/>
			</div>
		</CollapseLine>
	)
}
