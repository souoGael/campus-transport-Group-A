import React, { useState, useEffect } from "react";
import "./Rentals.css";
import SideMenu from "../SideMenu/SideMenu";
import SearchBar from "../SearchBar/SearchBar";
import { auth, firestore } from '../../utils/firebase.js';
import { doc, getDoc, updateDoc} from "firebase/firestore";
import Popup from '../EmergencyAlert/EmergencyAlert.jsx';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import BuildingMap from "../Map/BuildingMap.jsx";


const Rentals = () => {
  const navigate = useNavigate();
  const handleHOME = () => {
    navigate("/Homepage");
  };

  const [showPopup, setShowPopup] = useState(false);
  const [showLoadKuduPopup, setShowLoadKuduPopup] = useState(false);

  const [selectedBike, setSelectedBike] = useState(null);
  const [rental, setRental] = useState([]);
  const [UID, setUserId] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [kudu, setKudu] = useState(0); // Store user's Kudu Bucks

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

        // Fetch user document to check if location and kudu bucks exists
        const userRef = doc(firestore, 'Users', user.uid);
        getDoc(userRef).then((docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUserLocation(userData.location); // Set user's location
            setKudu(userData.kudu); // Set user's Kudu Bucks
            console.log('User location:', userData.location); // Log the location for debugging
          } else {
            setUserId(null);
            setUserLocation(null); 
            console.log('No user is logged in');
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
   
    if (kudu < 10) {
      alert("You need more Kudu Bucks to rent this ride.");
      handleClosePopup();
      return;
    }

    axios
      .post(`https://api-campus-transport.vercel.app/rent/${UID}/${ritem}/${rent}`)
      .then((response) => {
        console.log('Rental successful:', response.data);
        handleHOME();
        const newKuduBalance = kudu - 10;
        setKudu(newKuduBalance); // Update the local state

        const userRef = doc(firestore, 'Users', UID);
        updateDoc(userRef, {
          kudu: newKuduBalance,
        })
        .then(() => {
          console.log('Kudu Bucks updated successfully in Firestore.');
        })
        .catch((error) => {
          console.error('Error updating Kudu Bucks in Firestore:', error);
          alert('Error updating Kudu Bucks.');
        });

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
            <Popup />
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

                {/* Rent Button with Conditional Logic */}
                {!userLocation && ( // Only render the Rent button if userLocation is not present
                  <button
                    className="rentBtn"
                    onClick={() => {
                      if (kudu < 10) {
                        setShowLoadKuduPopup(true); // Show the popup to load more Kudu Bucks
                      } else {
                        handleRent(selectedBike?.id, selectedBike?.location);
                      }
                    }}
                    style={{ backgroundColor: kudu < 10 ? 'red' : 'green' }}
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