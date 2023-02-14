import _ from 'lodash'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './app'
import './index.css'

_.templateSettings.interpolate = /{{([\s\S]+?)}}/g

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
)
