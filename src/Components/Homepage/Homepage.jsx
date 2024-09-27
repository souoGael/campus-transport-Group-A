//Is this file needed?
import React from "react";
import { useNavigate } from "react-router-dom";

function Homepage() {
  const navigate = useNavigate();
  return (
    <div>
      <h1> Main Dashboard </h1>
      <button type="submit" onClick={() => navigate("/")}>
        Sign out
      </button>
    </div>
  );
}

export default Homepage;
