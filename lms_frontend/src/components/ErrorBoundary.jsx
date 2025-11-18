import React from 'react';

/**
 * PUBLIC_INTERFACE
 * ErrorBoundary captures rendering errors and displays a friendly Ocean Professional message.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Something went wrong' };
  }

  componentDidCatch(error, errorInfo) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <section style={{ maxWidth: 720, margin: '40px auto', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: 18, boxShadow: 'var(--ocn-shadow-1, 0 4px 12px rgba(12,32,80,0.08))' }}>
          <h1 style={{ margin: '0 0 8px', font: '800 20px/26px "Helvetica Neue", Arial, sans-serif', color: '#111827' }}>
            Unexpected error
          </h1>
          <p style={{ color: '#4B5563', fontSize: 14 }}>
            {this.state.message}
          </p>
          <p style={{ color: '#6B7280', fontSize: 12, marginTop: 6 }}>
            Try reloading the page. If the issue persists, contact support.
          </p>
        </section>
      );
    }
    return this.props.children;
  }
}
