import { Button } from '@mantine/core'
import produce from 'immer'
import React, { ReactNode } from 'react'
import imageUrl from '../../assets/components/pricing-simple-2.jpg'
import { deserializeElement } from '../../utils/deserialize'
import { BoxElement } from '../elements/extensions/box'
import { TextElement } from '../elements/extensions/text'
import { Controller, ElementOptions } from './controller'
import { ComponentName, Divider, DividerCollapsible, SimpleComponentOptionsProps } from './helpers'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { regenElement } from '../clipboard/copy-paste'
import { Element } from '../elements/element'
import { ColumnsElement } from '../elements/extensions/columns'
import { IconElement } from '../elements/extensions/icon'
import { LinkElement } from '../elements/extensions/link'
import { Expression } from '../states/expression'
import { BoxElementInput } from '../ui/box-element-input'
import { ColumnsElementInput } from '../ui/columns-element-input'
import { LinkElementInput } from '../ui/link-element-input'
import { TextElementInput } from '../ui/text-element-input'
import { DndTabs } from './helpers/dnd-tabs'
import { OptionsWrapper } from './helpers/options-wrapper'
import VerticalOptions from './helpers/vertical-options'

export class PricingSimple2 extends Controller {
	name = 'Simple pricing 2'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <PricingSimple2Options options={options} />
	}
}

// =============  renderOptions =============

function PricingSimple2Options({ options }: SimpleComponentOptionsProps) {
	const gridDiv = options.element.children?.[0] as ColumnsElement

	return (
		<OptionsWrapper>
			<ComponentName name="Simple pricing 2" />
			<ColumnsElementInput element={gridDiv} />
			<Divider title="Price columns" />
			<DndTabs
				containerElement={gridDiv}
				insertElement={() =>
					regenElement(
						createTile({
							title: 'Starter',
							yearlyPrice: '$9.99',
							monthlyPrice: '$10',
							lines: ['1 user', '10GB storage'],
						})
					)
				}
				renderItemOptions={(item) => (
					<MemTabOptions set={options.set} tileDiv={item as BoxElement} />
				)}
			/>
		</OptionsWrapper>
	)
}

type TabOptionsProps = {
	set: (element: Element) => void
	tileDiv: BoxElement
}

const TabOptions = ({ tileDiv, set }: TabOptionsProps) => {
	const title = tileDiv.children[0] as TextElement
	const yearlyPrice = tileDiv.children[1].children![0].children![0] as TextElement
	const monthlyPrice = tileDiv.children[1].children![1].children![0] as TextElement
	const ctaLink = tileDiv.children[3] as LinkElement
	const ctaText = ctaLink.children?.[0] as TextElement
	const featureLinesWrapper = tileDiv.children[2] as BoxElement

	return (
		<div className="flex flex-col items-stretch gap-y-2">
			<DividerCollapsible closed title="price">
				<TextElementInput label="Title" element={title} />
				<TextElementInput label="Yearly price" element={yearlyPrice} />
				<TextElementInput label="Monthly price" element={monthlyPrice} />
				<BoxElementInput label="Background color" element={tileDiv} />
			</DividerCollapsible>

			<DividerCollapsible closed title="Features">
				<VerticalOptions
					showDelete={true}
					set={set}
					containerDiv={featureLinesWrapper}
					items={featureLinesWrapper.children.map((child) => {
						const text = child.children?.[1] as TextElement
						return {
							id: child.id,
							content: <TextElementInput label="Title" element={text} />,
						}
					})}
				/>
				<Button
					className="mt-2"
					size="xs"
					onClick={() => {
						set(
							produce(featureLinesWrapper, (draft) => {
								draft.children?.push(regenElement(createLine('new feature')))
							})
						)
					}}
				>
					<FontAwesomeIcon icon={['fas', 'plus']} /> Add feature
				</Button>
			</DividerCollapsible>
			<Divider title="CTA" />
			<TextElementInput placeholder="CTA" label="Text" element={ctaText} />
			<LinkElementInput placeholder="Link" label="Link" element={ctaLink} />
		</div>
	)
}

const MemTabOptions = React.memo(TabOptions)

// #region defaultData

const wrapperDiv = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',
			alignItems: 'center',
			width: '100%',
			paddingTop: '40px',
			paddingBottom: '40px',
		},
	}
}).serialize()

const createTileTitle = () =>
	produce(new TextElement(), (draft) => {
		draft.style.desktop = {
			default: {
				textAlign: 'center',
				padding: '20px',
				fontSize: '28px',
				fontWeight: 'bold',
			},
		}
		draft.data.text = Expression.fromString('Standard')
	})

const createFeatureLine = () =>
	produce(new BoxElement(), (draft) => {
		draft.style.desktop = {
			default: {
				display: 'flex',
				alignItems: 'center',
				marginTop: '10px',
				marginBottom: '10px',
				marginLeft: '0px',
				marginRight: '0px',
			},
		}

		const icon = produce(new IconElement(), (draft) => {
			draft.style.desktop = {
				default: {
					flex: '0 0 auto',
					width: '16px',
					height: '16px',
					marginRight: '10px',
					color: '#6aa512',
				},
			}
			draft.style.tablet = {
				default: {
					width: '12px',
					height: '12px',
					marginRight: '8px',
				},
			}
			draft.style.mobile = {
				default: {
					width: '8px',
					height: '8px',
					marginRight: '4px',
				},
			}
			draft.data.name = 'check'
			draft.data.type = 'fas'
		})

		const text = produce(new TextElement(), (draft) => {
			draft.style.desktop = {
				default: {
					marginLeft: '8px',
					color: '#717171',
				},
			}
			draft.data.text = Expression.fromString(
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
			)
		})

		draft.children = [icon, text]
	})

const createLine = (text: string) => {
	return produce(createFeatureLine(), (draft) => {
		;(draft.children[1]! as TextElement).data.text = Expression.fromString(text)
	})
}

const featureLinesWrapper = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			marginTop: '20px',
			marginBottom: '20px',
			fontSize: '15px',
		},
	}
	draft.style.mobile = {
		default: {
			marginTop: '0px',
			marginBottom: '12px',
			fontSize: '10px',
		},
	}
})

const tileDetailsPrice = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			gap: '4px',
		},
	}

	const priceLarge = produce(new TextElement(), (draft) => {
		draft.style.desktop = {
			default: {
				fontSize: '48px',
				fontWeight: 'bold',
				color: 'inherit',
				margin: '0px',
			},
		}
		draft.data.text = Expression.fromString('$9.99')
	})

	const termLarge = produce(new TextElement(), (draft) => {
		draft.style.desktop = {
			default: {
				fontSize: '12px',
				fontWeight: 'bold',
				color: 'inherit',
				margin: '0px',
			},
		}
		draft.data.text = Expression.fromString('per month')
	})

	const largePriceWrapper = produce(new BoxElement(), (draft) => {
		draft.style.desktop = {
			default: {
				display: 'flex',
				alignItems: 'baseline',
				gap: '2px',
			},
		}
		draft.children = [priceLarge, termLarge]
	})

	const priceSmall = produce(new TextElement(), (draft) => {
		draft.style.desktop = {
			default: {
				fontSize: '12px',
				fontWeight: 'bold',
				margin: '0px',
			},
		}
		draft.data.text = Expression.fromString('$10')
	})

	const termSmall = produce(new TextElement(), (draft) => {
		draft.style.desktop = {
			default: {
				fontSize: '12px',
				fontWeight: 'bold',
				color: 'inherit',
				margin: '0px',
			},
		}
		draft.data.text = Expression.fromString('monthly')
	})
	const smallPriceWrapper = produce(new BoxElement(), (draft) => {
		draft.style.desktop = {
			default: {
				display: 'flex',
				alignItems: 'baseline',
				gap: '2px',
			},
		}
		draft.children = [priceSmall, termSmall]
	})

	draft.children = [largePriceWrapper, smallPriceWrapper]
})

const tileCta = produce(new LinkElement(), (draft) => {
	draft.style.desktop = {
		default: {
			color: '#7670f1',
			marginTop: '10px',
			width: '100%',
			height: 'auto',
			fontSize: '24px',
			fontWeight: 'bold',
			textAlign: 'center',
			textDecoration: 'none',
			cursor: 'pointer',
		},
	}

	draft.style.mobile = {
		default: {
			padding: '10px',
			borderRadius: '8px',
			marginTop: '8px',
			fontSize: '16px',
			fontWeight: 'bold',
		},
	}

	const text = produce(new TextElement(), (draft) => {
		draft.data.text = Expression.fromString('Learn more')
	})

	draft.data.href = Expression.fromString('#')
	draft.data.openInNewTab = false
	draft.children = [text]
})

const newTile = () =>
	produce(new BoxElement(), (draft) => {
		draft.style.desktop = {
			default: {
				display: 'flex',
				flexDirection: 'column',
				paddingLeft: '10%',
				paddingRight: '10%',
				height: ' max-content',
				boxShadow:
					'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px',
				borderRadius: '10px',
				paddingBottom: '30px',
			},
		}
		draft.children = [createTileTitle(), tileDetailsPrice, featureLinesWrapper, tileCta]
	})

function createTile({
	title,
	yearlyPrice,
	monthlyPrice,
	lines,
}: {
	title: string
	yearlyPrice: string
	monthlyPrice: string
	lines: string[]
}) {
	return produce(newTile(), (draft) => {
		const featureLines = lines.map((line) => createLine(line))
		;(draft.children[0]! as TextElement).data!.text = Expression.fromString(title)
		;(draft.children[1]! as BoxElement).children![0].children![0].data!.text =
			Expression.fromString(yearlyPrice)
		;(draft.children[1]! as BoxElement).children![1].children![0].data!.text =
			Expression.fromString(monthlyPrice)
		;(draft.children[2]! as BoxElement).children = featureLines
	})
}

const tiles = [
	createTile({
		title: 'Starter',
		yearlyPrice: '$9.99',
		monthlyPrice: '$10',
		lines: ['1 user', '10GB storage'],
	}),
	createTile({
		title: 'Basic',
		yearlyPrice: '$9.99',
		monthlyPrice: '$10',
		lines: ['1 user', '10 projects', '10 GB storage'],
	}),
	createTile({
		title: 'Pro',
		yearlyPrice: '$9.99',
		monthlyPrice: '$10',
		lines: ['1 user', '10 projects', '10 GB storage', 'E-mail support', 'Help center access'],
	}),
	createTile({
		title: 'Enterprise',
		yearlyPrice: '$9.99',
		monthlyPrice: '$10',
		lines: [
			'10 users',
			'Unlimited projects',
			'Unlimited storage',
			'Priority e-mail support',
			'Help center access',
			'Phone support',
			'SSL encryption',
		],
	}),
]

const grid = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'grid',
			gridTemplateColumns: '1fr 1fr 1fr 1fr',
			gridGap: '20px',
			width: '70%',
		},
	}
	draft.style.tablet = {
		default: {
			gridTemplateColumns: '1fr 1fr',
		},
	}
	draft.style.mobile = {
		default: {
			gridTemplateColumns: '1fr',
		},
	}
}).serialize()

const defaultData = {
	...wrapperDiv,
	components: [
		{
			...grid,
			components: tiles.map((tile) => tile.serialize()),
		},
	],
}
// #endregion
