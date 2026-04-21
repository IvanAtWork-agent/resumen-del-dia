import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#141412] flex items-center justify-center p-8">
          <div className="max-w-md text-center">
            <h1 className="font-serif text-2xl font-bold text-[#C41E3A] dark:text-[#E8304A] mb-4">
              El Resumen del Día
            </h1>
            <p className="text-[#1A1916] dark:text-[#F0EDE8] mb-2">
              Algo ha ido mal al cargar la aplicación.
            </p>
            <p className="text-sm text-[#6B6860] dark:text-[#9B9890] mb-6">
              {this.state.error.message}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#C41E3A] dark:bg-[#E8304A] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Recargar página
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
