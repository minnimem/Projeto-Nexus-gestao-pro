import React from "react";
import "./AppErrorBoundary.css";

const shouldExposeErrorDetails = import.meta.env.DEV;

export class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, errorCode: "" };
  }

  static getDerivedStateFromError(error) {
    return { error, errorCode: `NX-${Date.now().toString(36).toUpperCase()}` };
  }

  componentDidCatch(error, info) {
    if (shouldExposeErrorDetails) {
      console.error("Nexus One render error", error, info);
    }
  }

  render() {
    if (this.state.error) {
      const message = shouldExposeErrorDetails
        ? this.state.error.message || "Erro inesperado no frontend."
        : "Não foi possível abrir esta tela agora. Recarregue o sistema ou envie o código abaixo ao suporte.";

      return (
        <main className="fatal-error-page">
          <section className="fatal-error-card">
            <span>Falha ao renderizar tela</span>
            <h1>Nexus One encontrou um erro visual.</h1>
            <p>{message}</p>
            {this.state.errorCode && <small>Código de suporte: {this.state.errorCode}</small>}
            <button onClick={() => window.location.reload()} type="button">
              Recarregar sistema
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
