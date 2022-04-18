import React from "react";

import "./loading.css";

export default class LoadingComp extends React.Component {
  render() {
    return (
      <div className="loading-scene">
        <div className="load-container">
          <div className="load load1"></div>
          <div className="load load2"></div>
          <div className="load"></div>
        </div>
      </div>
    );
  }
}
