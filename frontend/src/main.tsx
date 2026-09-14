import React from 'react'
import {createRoot} from 'react-dom/client'
import {Provider} from 'react-redux'
import './style.css'
import App from './App'
import {store} from './store/store'
import {startContainersPolling} from './store/pollController'

const container = document.getElementById('root')

const root = createRoot(container!)

startContainersPolling()

root.render(
    <React.StrictMode>
        <Provider store={store}>
            <App/>
        </Provider>
    </React.StrictMode>
)
