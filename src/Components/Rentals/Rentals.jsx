import React, { useState, useEffect } from "react";
import "./Rentals.css";
import SideMenu from "../SideMenu/SideMenu";
import { auth, firestore } from '../../utils/firebase.js';
import { doc, getDoc, updateDoc} from "firebase/firestore";
import Popup from '../EmergencyAlert/EmergencyAlert.jsx';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import BuildingMap from "../Map/BuildingMap.jsx";
import { useUserData } from '../../utils/userDataUtils.js';

const Rentals = () => {
  const navigate = useNavigate();
  const handleProfile = () => {
    navigate("/Profile");
  };

  const { userData, userId, refetchUserData } = useUserData();
  const [isSearchBarEmpty, setIsSearchBarEmpty] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [showLoadKuduPopup, setShowLoadKuduPopup] = useState(false);

  const [selectedBike, setSelectedBike] = useState(null);
  const [rental, setRental] = useState([]);


  useEffect(() => {
    // Add class when component mounts
    document.body.classList.add("hide-mapbox-controls");

    // Remove class when component unmounts
    return () => {
      document.body.classList.remove("hide-mapbox-controls");
    };
  }, []);

  useEffect(() => {
    const turnElement = document.querySelector(".turn-by-turn");
    if (turnElement) {
      turnElement.style.display = isSearchBarEmpty ? "block" : "none";
    }
  }, [isSearchBarEmpty]);

  const handleQueryChange = (query) => {
    setIsSearchBarEmpty(query.trim() === "");
  };

  // Get data needs to fetch constantly due to the amount of simultaneous users, performing a rent, maybe set a refetch time
  useEffect(() => {
    axios
      .get('https://api-campus-transport.vercel.app/getRent')
      .then((response) => {
        setRental(response.data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  // Handle Rent button click
  const handleRent = (ritem, rent) => {
    if (!userId || !userData) {
      console.error("No user data found. Can't proceed with rental.");
      return;
    }

    if (userData.kudu < 10) {
      alert('You need more Kudu Bucks to rent this ride.');
      return;
    }

    axios
      .post(`https://api-campus-transport.vercel.app/rent/${userId}/${ritem}/${rent}`)
      .then((response) => {
        // console.log('Rental successful:', response.data);

        const newKuduBalance = userData.kudu - 10;
        const userRef = doc(firestore, 'Users', userId);

        updateDoc(userRef, { kudu: newKuduBalance })
          .then(() => {
            console.log('Kudu Bucks updated successfully in Firestore.');
          })
          .catch((error) => console.error('Error updating Kudu Bucks in Firestore:', error));
        
        alert('Rental successful!');
    
        sessionStorage.removeItem('userData'); // Clear sessionStorage, and the cosole that appers in rentals in for the profile being stored
        refetchUserData();
        handleProfile();
      })
      .catch((error) => {
        console.error('Error renting item:', error);
        alert('Error renting item.');
      });
  };


  const handleRentClick = (bike) => {
    setSelectedBike(bike);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedBike(null);
  };

  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleBar = () => {
  setIsCollapsed((prevState) => !prevState);
};

  return (
    <div className="rentals-container map-back">
      <div className="">
        <div className="back">
          <BuildingMap />
        </div>

        <div className="front">
          <SideMenu />
          <div>
            <Popup />
            <button 
              className={`rent-expand-button ${isCollapsed ? 'collapsed' : 'expanded'}`} 
              onClick={toggleBar}
            >
              {isCollapsed ? '▶' : '◀'}
            </button>
            <div className={`bicycle-list ${isCollapsed ? 'collapsed' : ''}`} id="rentalsWidth">
              {!isCollapsed && rental.map((i, index) => (
                <div className="bicycle-item" key={index}>
                  <h3>{i.id}</h3>
                  <p className="details-layout"> 
                    Location: {i.location} Availability: {i.availability}
                    <br /> 
                    Vehicle: {i.Vehicle}
                  </p>
                  <a
                    href="#"
                    className="rent-link"
                    onClick={() => handleRentClick(i)}
                    style={{ display: !userData.location ? 'block' : 'none' }} // Conditionally hide the Rent link
                  >
                    Rent
                  </a>
                </div>
              ))}
            </div>
          </div>

          {showPopup && (
            <div className="popup-overlay">
              <div className="popup-content">
                <h4>Rent {selectedBike?.id}</h4>
                <p>
                  Are you sure you want to rent this item? <br />
                  Location: {selectedBike?.location} <br />
                </p>

                {/* Rent Button with Conditional Logic */}
                {!userData.location && ( // Only render the Rent button if userLocation is not present
                  <button
                    className="rentBtn"
                    onClick={() => {
                      if (userData.kudu < 10) {
                        setShowLoadKuduPopup(true); // Show the popup to load more Kudu Bucks
                      } else {
                        handleRent(selectedBike?.id, selectedBike?.location);
                      }
                    }}
                    style={{ backgroundColor: userData.kudu < 10 ? 'red' : 'green' }}
                    >
                      Rent
                    </button>
                )}

                <button className="closeBtn" onClick={handleClosePopup}>Close</button>
              </div>
            </div>
          )}
          {/* Popup to Load More Kudu Bucks */}
          {showLoadKuduPopup && (
            <div className="popup-overlay">
              <div className="popup-content">
                <h4>Insufficient Kudu Bucks</h4>
                <p>
                  You do not have enough Kudu Bucks to rent this item. Please load more Kudu Bucks to proceed.
                </p>
                <button className="closeBtn" onClick={() => setShowLoadKuduPopup(false)}>
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Rentals;