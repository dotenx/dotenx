import { Controller } from '../../controllers/controller'
import { sofa } from './theme'

class Navbar extends Controller {
	name = 'Navbar'
	image = ''
	defaultData = sofa.navbar()
	renderOptions = () => <></>
}

class Hero extends Controller {
	name = 'Hero'
	image = ''
	defaultData = sofa.hero()
	renderOptions = () => <></>
}

class Logos extends Controller {
	name = 'Logos'
	image = ''
	defaultData = sofa.logos()
	renderOptions = () => <></>
}

class FeaturesText extends Controller {
	name = 'FeaturesText'
	image = ''
	defaultData = sofa.featuresText()
	renderOptions = () => <></>
}

class Features extends Controller {
	name = 'Features'
	image = ''
	defaultData = sofa.features()
	renderOptions = () => <></>
}

class Info extends Controller {
	name = 'Info'
	image = ''
	defaultData = sofa.info()
	renderOptions = () => <></>
}

class Cta extends Controller {
	name = 'Cta'
	image = ''
	defaultData = sofa.cta()
	renderOptions = () => <></>
}

export const sofaControllers = [Navbar, Hero, Logos, FeaturesText, Features, Info, Cta]
