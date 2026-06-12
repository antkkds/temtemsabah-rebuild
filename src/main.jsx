import { StrictMode, Component } from 'react'
import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (this.state.error) {
      return React.createElement('div', { style: { padding: '2rem', color: '#f00' } },
        React.createElement('h2', null, '❌ Render Error'),
        React.createElement('pre', { style: { fontSize: '0.8rem', whiteSpace: 'pre-wrap' } },
          this.state.error.message + '\n' + (this.state.error.stack || '').split('\n').slice(0, 5).join('\n')
        )
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
