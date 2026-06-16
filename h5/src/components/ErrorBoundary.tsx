import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[100svh] bg-bg-primary flex flex-col items-center justify-center px-6 text-center">
          <h1 className="text-title font-serif-zh text-text-primary mb-4">出了点问题</h1>
          <p className="text-caption text-text-secondary mb-6">
            {this.state.error?.message || '页面渲染出错'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.href = '/';
            }}
            className="px-6 py-3 rounded-pill bg-text-primary text-white text-caption font-sans-zh"
          >
            返回首页
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
