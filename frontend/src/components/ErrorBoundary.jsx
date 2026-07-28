import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    
    // If it's a chunk load error (usually means a new version was deployed),
    // force a hard reload of the page to get the new assets.
    if (
      error.name === 'ChunkLoadError' ||
      (error.message && error.message.includes('dynamically imported module')) ||
      (error.message && error.message.includes('Failed to fetch dynamically imported module'))
    ) {
      window.location.reload(true);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white-bg p-6 text-center">
          <h1 className="font-heading text-2xl font-bold text-black mb-4">Something went wrong</h1>
          <p className="text-paragraph text-sm mb-6">
            We're having trouble loading this page. This usually happens when the app has been updated.
          </p>
          <button
            onClick={() => window.location.reload(true)}
            className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
