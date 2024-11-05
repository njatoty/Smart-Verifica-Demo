import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Met à jour l'état pour afficher l'interface de secours
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Vous pouvez également enregistrer l'erreur dans un service de rapport d'erreurs
    console.error("Erreur capturée par ErrorBoundary : ", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Vous pouvez rendre n'importe quelle interface de secours personnalisée
      return <h1>Quelque chose s'est mal passé. Veuillez réessayer plus tard.</h1>;
      
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
