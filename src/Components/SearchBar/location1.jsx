import React, { useEffect } from "react";
import "./location1.css";
import { useNavigate } from "react-router-dom";
import SideMenu from "../SideMenu/SideMenu";
import SearchBar from "../SearchBar/SearchBar";
import BuildingMap from "../../BuildingMap";
//import { FaRegListAlt } from "react-icons/fa";
//import { IoEyeSharp, IoMailSharp } from "react-icons/io5";

const LabPage = () => {
  useEffect(() => {
    // Add class when component mounts
    document.body.classList.add("hide-mapbox-controls");

    // Remove class when component unmounts
    return () => {
      document.body.classList.remove("hide-mapbox-controls");
    };
  }, []);

  const navigate = useNavigate();

  const handleLoc = () => {
    navigate("./location1");
  };

  return (
    <div className="list-page">
      <div className="back">
        <BuildingMap />
      </div>

      <div className="front">
        <SideMenu />
        <div className="lab-container map-back">
          <SearchBar />
          <div className="lab-content">
            <h2>MATHEMATICAL SCIENCE LABS</h2>
            <p>
              The Mathematical Science Labs (MSL) at Wits, affectionately dubbed
              "The Maze of Scientific Lunacy," is a sprawling computer network
              of corridors where time bends, and logic takes the scenic route.
              Navigating MSL is akin to using a first year's pathfinder just
              when you think you’ve found the exit, you realise you’re back at
              the beginning, but now on a different floor. The labs are a
              sanctuary for mathematicians, where t the Wi-Fi has its own
              theorem for connectivity.{" "}
            </p>
            <button className="direction-btn">Direction</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabPage;
