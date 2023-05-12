import ctaImg from '../../../assets/themes/theme1/preview/cta.png'
import featuresTextImg from '../../../assets/themes/theme1/preview/features-text.png'
import featuresImg from '../../../assets/themes/theme1/preview/features.png'
import heroImg from '../../../assets/themes/theme1/preview/hero.png'
import infoImg from '../../../assets/themes/theme1/preview/info.png'
import logosImg from '../../../assets/themes/theme1/preview/logos.png'
import navbarImg from '../../../assets/themes/theme1/preview/navbar.png'
import { Component, ElementOptions } from '../../components/component'
import { ComponentWrapper } from '../../components/helpers/component-wrapper'
import { DndTabs } from '../../components/helpers/dnd-tabs'
import { OptionsWrapper } from '../../components/helpers/options-wrapper'
import { box, img, txt } from '../../elements/constructor'
import { Element } from '../../elements/element'
import { BoxElement } from '../../elements/extensions/box'
import { ButtonElement } from '../../elements/extensions/button'
import { IconElement } from '../../elements/extensions/icon'
import { ImageElement } from '../../elements/extensions/image'
import { TextElement } from '../../elements/extensions/text'
import { BoxStyler } from '../../simple/stylers/box-styler'
import { ButtonStyler } from '../../simple/stylers/button-styler'
import { IconStyler } from '../../simple/stylers/icon-styler'
import { ImageStyler } from '../../simple/stylers/image-styler'
import { TextStyler } from '../../simple/stylers/text-styler'
import { theme1 } from './theme'

class Navbar extends Component {
	name = 'Theme 1 Navbar'
	image = navbarImg
	defaultData = theme1.navbar()
	renderOptions = ({ element: wrapper }: ElementOptions) => {
		const links = wrapper.find<BoxElement>(theme1.tags.navbar.links)!
		const button = wrapper.find<ButtonElement>(theme1.tags.navbar.button)!

		return (
			<ComponentWrapper name={this.name}>
				<ButtonStyler label="Button" element={button} />
				<DndTabs
					containerElement={links}
					insertElement={() => txt('Link')}
					renderItemOptions={(item) => (
						<TextStyler label="Link" element={item as TextElement} />
					)}
				/>
			</ComponentWrapper>
		)
	}
}

class Hero extends Component {
	name = 'Theme 1 Hero'
	image = heroImg
	defaultData = theme1.hero()
	renderOptions = ({ element: wrapper }: ElementOptions) => {
		const title = wrapper.find<TextElement>(theme1.tags.hero.title)!
		const desc = wrapper.find<TextElement>(theme1.tags.hero.desc)!
		const button = wrapper.find<ButtonElement>(theme1.tags.hero.button)!
		const stats = wrapper.find<BoxElement>(theme1.tags.hero.stats)!
		const img = wrapper.find<ImageElement>(theme1.tags.hero.img)!

		return (
			<ComponentWrapper name={this.name}>
				<TextStyler label="Title" element={title} />
				<TextStyler label="Description" element={desc} />
				<ButtonStyler label="Button" element={button} />
				<ImageStyler element={img} />
				<DndTabs
					containerElement={stats}
					insertElement={() => theme1.stat({ title: 'title', desc: 'description' })}
					renderItemOptions={(item) => <StatOptions item={item} />}
				/>
			</ComponentWrapper>
		)
	}
}

function StatOptions({ item }: { item: Element }) {
	const line = item.find<BoxElement>(theme1.tags.hero.stat.line)!
	const title = item.find<TextElement>(theme1.tags.hero.stat.title)!
	const desc = item.find<TextElement>(theme1.tags.hero.stat.desc)!

	return (
		<OptionsWrapper>
			<TextStyler label="Title" element={title} />
			<TextStyler label="Description" element={desc} />
			<BoxStyler label="Line" element={line} />
		</OptionsWrapper>
	)
}

class Logos extends Component {
	name = 'Theme 1 Logos'
	image = logosImg
	defaultData = theme1.logos()
	renderOptions = ({ element: wrapper }: ElementOptions) => {
		const logos = wrapper.find<BoxElement>(theme1.tags.logos)!

		return (
			<ComponentWrapper name={this.name}>
				<DndTabs
					containerElement={logos}
					insertElement={img}
					renderItemOptions={(item) => <ImageStyler element={item as ImageElement} />}
				/>
			</ComponentWrapper>
		)
	}
}

class FeaturesText extends Component {
	name = 'Theme 1 Features Text'
	image = featuresTextImg
	defaultData = theme1.featuresText()
	renderOptions = ({ element: wrapper }: ElementOptions) => {
		const title = wrapper.find<TextElement>(theme1.tags.featuresText.title)!
		const desc = wrapper.find<TextElement>(theme1.tags.featuresText.desc)!

		return (
			<ComponentWrapper name={this.name}>
				<TextStyler label="Title" element={title} />
				<TextStyler label="Description" element={desc} />
			</ComponentWrapper>
		)
	}
}

class Features extends Component {
	name = 'Theme 1 Features'
	image = featuresImg
	defaultData = theme1.features()
	renderOptions = ({ element: wrapper }: ElementOptions) => {
		const features = wrapper.find<BoxElement>(theme1.tags.features.grid)!

		return (
			<ComponentWrapper name={this.name}>
				<DndTabs
					containerElement={features}
					insertElement={box}
					renderItemOptions={(item) => <FeatureOptions item={item} />}
				/>
			</ComponentWrapper>
		)
	}
}

function FeatureOptions({ item }: { item: Element }) {
	const icon = item.find<IconElement>(theme1.tags.features.icon)!
	const title = item.find<TextElement>(theme1.tags.features.title)!
	const desc = item.find<TextElement>(theme1.tags.features.desc)!

	return (
		<OptionsWrapper>
			<IconStyler label="Icon" element={icon} />
			<TextStyler label="Title" element={title} />
			<TextStyler label="Description" element={desc} />
		</OptionsWrapper>
	)
}

class Info extends Component {
	name = 'Theme 1 Info'
	image = infoImg
	defaultData = theme1.info()
	renderOptions = ({ element: wrapper }: ElementOptions) => {
		const title = wrapper.find<TextElement>(theme1.tags.info.title)!
		const desc = wrapper.find<TextElement>(theme1.tags.info.desc)!
		const button = wrapper.find<ButtonElement>(theme1.tags.info.button)!
		const img = wrapper.find<ImageElement>(theme1.tags.info.img)!

		return (
			<ComponentWrapper name={this.name}>
				<TextStyler label="Title" element={title} />
				<TextStyler label="Description" element={desc} />
				<ButtonStyler label="Button" element={button} />
				<ImageStyler element={img} />
			</ComponentWrapper>
		)
	}
}

class Cta extends Component {
	name = 'Theme 1 Cta'
	image = ctaImg
	defaultData = theme1.cta()
	renderOptions = ({ element: wrapper }: ElementOptions) => {
		const button = wrapper.find<ButtonElement>(theme1.tags.cta.button)!

		return (
			<ComponentWrapper name={this.name}>
				<ButtonStyler label="Button" element={button} />
			</ComponentWrapper>
		)
	}
}

export const theme1Components = { Navbar, Hero, Logos, FeaturesText, Features, Info, Cta }
