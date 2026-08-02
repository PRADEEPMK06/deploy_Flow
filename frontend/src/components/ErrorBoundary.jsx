import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Deployment UI crash captured by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center rounded-2xl border border-rose-500/20 bg-slate-900 p-8 shadow-xl">
          <div className="max-w-lg text-center space-y-4">
            <h2 className="text-xl font-bold text-white">Deployment view failed to render</h2>
            <p className="text-sm text-slate-400">
              The page hit an unexpected runtime error. The app is still alive, and you can recover without a full refresh.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
              >
                Reload view
              </button>
              <a
                href="/"
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
              >
                Go home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;