import React from "react";
import "./spinner.css";

// Copied from https://epic-spinners.epicmax.co/
export default function Spinner() {
  return (
    <>
      <div className="fingerprint-spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
    </>
  );
}
