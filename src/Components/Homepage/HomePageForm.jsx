import React, { useEffect, useState } from "react";
import "./HomePageForm.css";
import SideMenu from "../SideMenu/SideMenu";
import SearchBar from "../SearchBar/SearchBar";
import { useLocation } from "react-router-dom";
import BuildingMap from "../Map/BuildingMap.jsx";
import Popup from '../EmergencyAlert/EmergencyAlert.jsx';

const HomepageForm = () => {
  const location = useLocation();
  const [showWelcome, setShowWelcome] = useState(false);
  const [fullName, setFullName] = useState("");
  const [isSearchBarEmpty, setIsSearchBarEmpty] = useState(true);

  useEffect(() => {
    if (location.state && location.state.fullName) {
      setFullName(location.state.fullName);
      setShowWelcome(true);
      const timer = setTimeout(() => {
        setShowWelcome(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  useEffect(() => {
    const turnElement = document.querySelector(".turn-by-turn");
    if (turnElement) {
      turnElement.style.display = isSearchBarEmpty ? "block" : "none";
    }
  }, [isSearchBarEmpty]);

  const handleQueryChange = (query) => {
    setIsSearchBarEmpty(query.trim() === "");
  };

  return (
    <div className="homepage-container">
      <SideMenu />
      <div className="content-container map-back">
        <div className="back">
          <BuildingMap />
        </div>
        <div className="front">
          <SearchBar onQueryChange={handleQueryChange} />
          <Popup />
          {/* The Turn div is assumed to already exist in your HTML structure */}
        </div>
      </div>
    </div>
  );
};

export default HomepageForm;
