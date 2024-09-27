import React from "react";
import { FiMapPin } from "react-icons/fi"; // For FiMapPin
import { GrBus } from "react-icons/gr"; // For GrBus
import { CiRoute, CiLogout } from "react-icons/ci"; // For CiRoute and CiLogout
import { FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./SideMenu.css"; // Import your CSS file
import logo from "../Assets/black_logo.jpg";

const SideMenu = () => {
  const navigate = useNavigate();

  const handleHOME = () => {
    navigate("/Homepage");
  };

  const handleBUS = () => {
    navigate("/BusSchedule");
  };

  const handleRentals = () => {
    navigate("/Rentals");
  };

  const handleLogOut = () => {
    navigate("/Logout");
  };

  const handleProfile = () => {
    navigate("/Profile");
  };

  return (
    <div className="side-menu">
      <img src={logo} alt="logo" className="logo" />
      <div className="menu-divider"></div> {/* Divider Line */}
      <div className="menu-item">
        <a onClick={handleProfile}>
          <span>
            <FaUser className="icon" />
          </span>
          <span className="menu-text">Profile</span>
        </a>
      </div>
      <div className="menu-item">
        <a onClick={handleHOME}>
          <span>
            {" "}
            <FiMapPin className="icon" />
          </span>
          <span className="menu-text">Home</span>
        </a>
      </div>
      <div className="menu-item">
        <a onClick={handleBUS}>
          <span>
            <GrBus className="icon" />
          </span>
          <span className="menu-text">Bus Schedule</span>
        </a>
      </div>
      <div className="menu-item">
        <a onClick={handleRentals}>
          <span>
            <CiRoute className="icon" />
          </span>
          <span className="menu-text">Rentals</span>
        </a>
      </div>
      <div className="menu-item">
        <a onClick={handleLogOut}>
          <span>
            <CiLogout className="icon" />
          </span>
          <span className="menu-text">Logout</span>
        </a>
      </div>
    </div>
  );
};

export default SideMenu;
