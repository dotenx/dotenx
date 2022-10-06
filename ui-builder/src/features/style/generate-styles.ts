import _ from 'lodash'
import { mapStyleToKebabCase } from '../../api/mapper'
import { Element } from '../elements/element'
import { CssSelector, SelectorStyle, Style } from '../elements/style'
import { ViewportDevice } from '../viewport/viewport-store'
import { useClassesStore } from './classes-store'

const globalPageStyles = `
@import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap');
*, *::before, *::after {
	box-sizing: border-box;
  }
  * {
	margin: 0;
  }
  html, body {
	height: 100%;
  }
  body {
	line-height: 1.5;
	-webkit-font-smoothing: antialiased;
	font-family: 'Roboto', sans-serif;
  }
  img, picture, video, canvas, svg {
	display: block;
	max-width: 100%;
  }
  input, button, textarea, select {
	font: inherit;
  }
  p, h1, h2, h3, h4, h5, h6 {
	overflow-wrap: break-word;
  }
  #root, #__next {
	isolation: isolate;
  }
`

export const useGenerateStyles = (elements: Element[]) => {
	const classNames = useClassesStore((store) => store.classes)
	const desktopIds = generateCssIds(elements, 'desktop')
	const tabletIds = generateCssIds(elements, 'tablet')
	const mobileIds = generateCssIds(elements, 'mobile')

	const desktopClasses = generateCssClasses(classNames, 'desktop')
	const tabletClasses = generateCssClasses(classNames, 'tablet')
	const mobileClasses = generateCssClasses(classNames, 'mobile')

	const generatedStyles = `
		${globalPageStyles}
		${desktopClasses}
		${desktopIds}
		@media (max-width: 767px) { ${tabletClasses} }
		@media (max-width: 478px) { ${mobileClasses} }
		@media (max-width: 767px) { ${tabletIds} }
		@media (max-width: 478px) { ${mobileIds} }
	`

	return generatedStyles
}

const generateCssIds = (elements: Element[], device: ViewportDevice) => {
	return flatElements(elements)
		.map((element) => generateCssId(element.id, element.style[device] ?? {}))
		.join('\n')
}

const flatElements = (elements: Element[]): Element[] => {
	return elements.map((element) => [element, ...flatElements(element.children ?? [])]).flat()
}

const generateCssId = (id: string, styles: SelectorStyle) => {
	return _.toPairs(styles)
		.map(([selector, style]) => {
			const cssSelector = selector === CssSelector.Default ? '' : `:${selector}`
			const stringifiedStyles = stylesToString(mapStyleToKebabCase(style))
			return `.${id}${cssSelector} { ${stringifiedStyles} }`
		})
		.join('\n')
}

const generateCssClasses = (classNames: Record<string, Style>, viewport: ViewportDevice) => {
	return _.toPairs(classNames)
		.map(([className, styles]) =>
			_.toPairs(styles[viewport])
				.map(([selector, style]) => {
					const cssSelector = selector === CssSelector.Default ? '' : `:${selector}`
					const stringifiedStyles = stylesToString(mapStyleToKebabCase(style))
					return `.${className}${cssSelector} { ${stringifiedStyles} }`
				})
				.join('\n')
		)
		.join('\n')
}

const stylesToString = (styles: Record<string, string>) => {
	return _.toPairs(styles)
		.map(([key, value]) => `${key}: ${value};`)
		.join(' ')
}
