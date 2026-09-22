import React from "react";

export default class LazyErrorBoundary extends React.Component {
  constructor (props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError () {
    return { hasError: true };
  }

  componentDidCatch (error) {
    console.error("Lazy component load failed:", error);
  }

  render () {
    if (this.state.hasError) {
      return <div className="react-error">Component failed to load</div>;
    }
    return this.props.children;
  }
}
