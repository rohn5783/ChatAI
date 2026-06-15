
import { createRoot } from 'react-dom/client'
import './css/dashboard.css'
import './css/buttons.css'
import App from './app/App'
import { store } from './app/app.store'
import { Provider } from 'react-redux'

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>
)

