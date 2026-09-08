import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
          <div className="bg-base-100 border-4 border-black rounded-2xl shadow-[8px_8px_0_0_#000] p-8 max-w-sm text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-error/10 p-3 rounded-full">
                <AlertTriangle size={32} className="text-error" />
              </div>
            </div>
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <p className="text-sm text-base-content/60 mb-6">
              An unexpected error occurred. Try reloading the page.
            </p>
            <button
              onClick={this.handleReload}
              className="w-full py-3 rounded-xl bg-[#FF5A5F] text-white font-bold border-2 border-black shadow-[4px_4px_0_0_#000] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;