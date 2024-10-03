import React from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import "./SideMenu.css"; // Import your CSS file
import logo from "../Assets/black_logo.jpg";
import { MdLocationPin, MdDirectionsBus, MdAccountCircle, MdLogout } from "react-icons/md";
import { TbRoute } from "react-icons/tb";

const SideMenu = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Get current location

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="side-menu">
      <img src={logo} alt="logo" className="logo" />
      <div className="menu-divider"></div> {/* Divider Line */}
      
      <div className={`menu-item ${location.pathname === "/Homepage" ? "active" : ""}`}>
        <a onClick={() => handleNavigation("/Homepage")}>
          <MdLocationPin className="icon" />
          <span className="menu-text">Home</span>
        </a>
      </div>

      <div className={`menu-item ${location.pathname === "/BusSchedule" ? "active" : ""}`}>
        <a onClick={() => handleNavigation("/BusSchedule")}>
          <MdDirectionsBus className="icon" />
          <span className="menu-text">Bus Schedule</span>
        </a>
      </div>

      <div className={`menu-item ${location.pathname === "/Rentals" ? "active" : ""}`}>
        <a onClick={() => handleNavigation("/Rentals")}>
          <TbRoute className="icon" />
          <span className="menu-text">Rentals</span>
        </a>
      </div>

      <div className={`menu-item ${location.pathname === "/Profile" ? "active" : ""}`}>
        <a onClick={() => handleNavigation("/Profile")}>
          <MdAccountCircle className="icon" />
          <span className="menu-text">Profile</span>
        </a>
      </div>

      <div className={`menu-item ${location.pathname === "/Logout" ? "active" : ""}`}>
        <a onClick={() => handleNavigation("/Logout")}>
          <MdLogout className="icon" />
          <span className="menu-text">Logout</span>
        </a>
      </div>
    </div>
  );
};

export default SideMenu;
