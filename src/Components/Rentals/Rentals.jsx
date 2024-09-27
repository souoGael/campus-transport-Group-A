import React, { useState, useEffect } from "react";
import "./Rentals.css";
import SideMenu from "../SideMenu/SideMenu";
import SearchBar from "../SearchBar/SearchBar";
import { auth, firestore } from '../../utils/firebase.js';
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import BuildingMap from "../../BuildingMap.jsx";
import axios from 'axios';


const Rentals = () => {
  const navigate = useNavigate();
  const handleHOME = () => {
    navigate("/Homepage");
  };

  const [showPopup, setShowPopup] = useState(false);
  const [selectedBike, setSelectedBike] = useState(null);
  const [rental, setRental] = useState([]);
  const [UID, setUserId] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    // Add class when component mounts
    document.body.classList.add("hide-mapbox-controls");

    // Remove class when component unmounts
    return () => {
      document.body.classList.remove("hide-mapbox-controls");
    };
  }, []);

  // Check if the user is logged in and get their ID
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in, set the user ID
        setUserId(user.uid);
        console.log('User ID:', user.uid);

        // Fetch user document to check if location exists
        const userRef = doc(firestore, 'Users', user.uid);
        getDoc(userRef).then((docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUserLocation(userData.location); // Set user's location
            console.log('User location:', userData.location); // Log the location for debugging
          } else {
            console.log('No such user document!');
          }
        }).catch((error) => {
          console.error('Error fetching user document:', error);
        });
      } else {
        // User is signed out
        setUserId(null);
        setUserLocation(null); // Reset user location
        console.log('No user is logged in');
      }
    });

    // Clean up subscription on unmount
    return () => unsubscribe();
  }, []);

  // Get data
  useEffect(() => {
    // Fetch data from your API http://localhost:5000/getRent
    fetch('/api/getRent')
      .then((response) => {
        setRental(response.data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  // Handle Rent button click
  const handleRent = (ritem, rent) => {
    // console.log('Rental ID:', ritem); // Check rental ID
    // console.log('User ID:', UID); // Check user ID
    // console.log('Location:', rent); // Check user ID

    axios
      .post(`/api/rent/${UID}/${ritem}/${rent}`, {
        item: ritem,
        location: rent
      })
      .then((response) => {
        console.log('Rental successful:', response.data);
        handleHOME();
        alert('Rental successful!');
        handleClosePopup();
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

  return (
    <div className="rentals-container map-back">
      <div className="">
        <div className="back">
          <BuildingMap />
        </div>

        <div className="front">
          <SideMenu />
          <div>
            <SearchBar />
            <div className="bicycle-list" id="rentalsWidth">
              {rental.map((i, index) => (
                <div className="bicycle-item" key={index}>
                  <h3>{i.id}</h3>
                  <p>
                    Location: {i.location} Availability: {i.availability}
                  </p>
                  <a
                    href="#"
                    className="rent-link"
                    onClick={() => handleRentClick(i)}
                    style={{ display: !userLocation ? 'block' : 'none' }} // Conditionally hide the Rent link
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

                {!userLocation && ( // Only render the Rent button if userLocation is not present
                  <button 
                    className="rentBtn" 
                    onClick={() => handleRent(selectedBike?.id, selectedBike?.location)}
                  >
                    Rent
                  </button>
                )}

                <button className="closeBtn" onClick={handleClosePopup}>Close</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Rentals;
