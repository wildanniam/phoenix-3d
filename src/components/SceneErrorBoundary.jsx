import { Component } from 'react'

export default class SceneErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    console.error('Phoenix scene failed to render:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="scene-error" role="alert">
          <strong>The phoenix could not enter this browser.</strong>
          <span>Try reloading the page or enabling WebGL hardware acceleration.</span>
          <button type="button" onClick={() => window.location.reload()}>Reload experience</button>
        </div>
      )
    }

    return this.props.children
  }
}
