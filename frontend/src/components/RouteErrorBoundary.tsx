import React from 'react';

class RouteErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error('Error caught in RouteErrorBoundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // Fallback UI for invalid route parameters
            return <h1>Invalid Route Parameters. Please try again.</h1>;
        }

        return this.props.children; // Render children if there's no error
    }
}

export default RouteErrorBoundary;