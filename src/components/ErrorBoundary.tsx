import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Cyber Kawach Uncaught Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetAndReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0D1F2D] text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#132A3E] border border-cyan-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
              <ShieldAlert className="w-9 h-9" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Cyber Kawach
              </h1>
              <p className="text-sm text-cyan-400 font-medium mt-1">
                Click Smart. Stay Safe.
              </p>
              <h2 className="text-lg font-semibold text-gray-200 mt-4">
                Application Rendering Encountered an Issue
              </h2>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                The application prevented an unhandled UI crash from displaying a blank screen. You can reload the page or reset cached session data below.
              </p>
            </div>

            {this.state.error && (
              <div className="text-left bg-[#0A1622] border border-gray-800 rounded-xl p-3 max-h-36 overflow-y-auto">
                <p className="text-xs font-mono text-red-400 break-words">
                  {this.state.error.message || String(this.state.error)}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>
              <button
                onClick={this.handleResetAndReload}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium text-sm transition-all border border-gray-700 cursor-pointer"
                title="Clears any corrupt cached local state and reloads"
              >
                <Trash2 className="w-4 h-4" />
                Reset Cache
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
