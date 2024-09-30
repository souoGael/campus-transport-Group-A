import React, { useEffect, useState, useRef } from "react";
import "./BusSchedule.css";
import SideMenu from "../SideMenu/SideMenu";
import SearchBar from "../SearchBar/SearchBar";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import BuildingMap from "../Map/BuildingMap.jsx";

const Busschedule = () => {
  const [buses, setBuses] = useState([]);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [selectedRoutes, setSelectedRoutes] = useState(["ALL"]);
  const db = getFirestore();
  const scheduleRef = useRef();

  // Update current date and time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Get data from Firestore
  useEffect(() => {
    const fetchBusSchedules = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Transportation Schedules"));
        const busSchedules = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBuses(busSchedules);
      } catch (error) {
        console.error("Error fetching bus schedules:", error);
      }
    };

    fetchBusSchedules();
  }, [db]);

  // Function to handle filter button clicks
  const handleFilterClick = (route) => {
    setSelectedRoutes((prevSelectedRoutes) => {
      if (route === "ALL") {
        return ["ALL"];
      } else {
        const isSelected = prevSelectedRoutes.includes(route);
        if (isSelected) {
          const updatedRoutes = prevSelectedRoutes.filter((r) => r !== route);
          return updatedRoutes.length === 0 ? ["ALL"] : updatedRoutes;
        } else {
          return prevSelectedRoutes.includes("ALL")
            ? [route]
            : [...prevSelectedRoutes, route];
        }
      }
    });
  };

  // Filter buses to show only the upcoming ones based on current time
  const getUpcomingBuses = () => {
    const currentDay = currentDateTime.toLocaleString("en-US", { weekday: "long" });
    const currentTimeInMinutes = currentDateTime.getHours() * 60 + currentDateTime.getMinutes(); // Current time in minutes

    // Filter schedules based on the current day, selected routes, and upcoming time
    return buses
      .filter((bus) => bus.days && bus.days.includes(currentDay)) // Only include buses running on the current day
      .filter((bus) => {
        // Filter based on selected routes
        if (selectedRoutes.includes("ALL")) return true;
        return selectedRoutes.some((route) => bus.routeName.includes(route));
      })
      .flatMap((bus) => {
        if (!bus.schedule) return []; // Skip if the bus has no schedule
        return bus.schedule.map((time) => {
          const [hours, minutes] = time.split(":").map(Number);
          const timeInMinutes = hours * 60 + minutes;
          return { ...bus, time, timeInMinutes };
        });
      })
      .filter((bus) => bus.timeInMinutes >= currentTimeInMinutes) // Show only upcoming times
      .sort((a, b) => a.timeInMinutes - b.timeInMinutes); // Sort by time
  };

  const upcomingBuses = getUpcomingBuses();

  // Function to download the full schedule as PDF
  const downloadScheduleAsPDF = () => {
    const input = scheduleRef.current;
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 190; // Adjust the image width in the PDF
      const pageHeight = 295; // A4 size page height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save("bus_schedule.pdf");
    });
  };

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
              <div className="date-time-header">
                <p>{currentDateTime.toLocaleDateString()}</p>
                <p>{currentDateTime.toLocaleTimeString()}</p>
              </div>

              {/* Filter Buttons */}
              <div className="filter-buttons">
                {["ALL", "Full Circuit", "Reverse", "WJ", "NSW | Rosebank", "EOH | KNK", "NSW | WEC", "KNK | Rosebank"].map((route) => (
                  <button
                    key={route}
                    className={`filter-button ${selectedRoutes.includes(route) ? "active" : ""}`}
                    onClick={() => handleFilterClick(route)}
                    style={{ backgroundColor: selectedRoutes.includes(route) ? "green" : "" }}
                  >
                    {route}
                  </button>
                ))}
              </div>

              {/* Download Button */}
              <button className="download-button" onClick={downloadScheduleAsPDF}>
                Download Schedule as PDF
              </button>

              {/* Schedule Container */}
              <div className="schedule" ref={scheduleRef}>
                {upcomingBuses.length > 0 ? (
                  upcomingBuses.map((item, index) => (
                    <div className="schedule-item" key={index}>
                      <div className="time">{item.time}</div>
                      <div className="circle"></div>
                      <div className="details">
                        <h3>{item.routeName}</h3>
                        <p>{item.stops && item.stops.join(" > ")}</p>
                        <p>Days: {item.days && item.days.join(", ")}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No more buses available today.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Busschedule;
