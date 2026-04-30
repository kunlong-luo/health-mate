import React, { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#FDFDF9] px-6 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-semibold text-stone-800 mb-3">糟糕，出现了一点问题</h2>
          <p className="text-stone-500 mb-8 max-w-md">
            页面渲染遇到意外错误，由于网络延迟或缓存问题导致。请尝试刷新页面。
          </p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-[#5A5A40] text-white px-6 py-3 rounded-full font-medium hover:bg-[#4a4a35] transition"
          >
            <RefreshCw className="w-5 h-5" />
            刷新重试
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
