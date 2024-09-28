import React, { useEffect, useState } from "react";
import "./BusSchedule.css";
import SideMenu from "../SideMenu/SideMenu";
import SearchBar from "../SearchBar/SearchBar";
import BuildingMap from "../../BuildingMap";
// import API_BASE_URL from '../../url_config';
// import axios from "axios";
//import { FaRegListAlt } from "react-icons/fa";
//import { IoEyeSharp, IoMailSharp } from "react-icons/io5";
//import { useNavigate } from "react-router-dom";

const Busschedule = () => {
  const [buses, setBuses] = useState([]);

  useEffect(() => {
    // Add class when component mounts
    document.body.classList.add("hide-mapbox-controls");

    // Remove class when component unmounts
    return () => {
      document.body.classList.remove("hide-mapbox-controls");
    };
  }, []);

  //Get data
  useEffect(() => {
    // Fetch data from your API local URL: http://localhost:7071/api/bus/schedules just keep the /api/bus/schedules for the deployment
    fetch(`https://api-campus-transport.vercel.app/getSchedule`)
      .then((response) => {
        setBuses(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  return (
    <div className="Bus-container">
      <div className="content-container map-back">
        <div className="back">
          <BuildingMap />
        </div>

        <div className="front">
          <SideMenu />
          <div>
            <SearchBar id="busSearch" />
            <div className="bus-schedule-container">
              <h2 className="BUs">Bus Schedule</h2>
              <div className="schedule">
                {buses.map((item, index) => (
                  <div className="schedule-item" key={index}>
                    <div className="time">{item.time}</div>
                    <div className="circle"></div>
                    <div className="details">
                      <h3>{item.routename}</h3>
                      <p>{item.route}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Busschedule;
