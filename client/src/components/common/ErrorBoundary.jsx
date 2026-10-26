import { Component } from 'react';
import { TriangleAlert } from 'lucide-react';
import StateBox from './StateBox.jsx';

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('UI error:', error.message);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="container">
        <StateBox
          icon={TriangleAlert}
          title="This page ran into a problem"
          message="Reload the page to try again. If it keeps happening, contact support."
          action={<button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>Reload page</button>}
        />
      </div>
    );
  }
}
