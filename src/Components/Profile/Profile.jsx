import React, { useEffect, useState } from "react";
import "./Profile.css";
import SideMenu from "../SideMenu/SideMenu";
import { FaUser } from "react-icons/fa";
import axios from "axios";
import { sendPasswordResetEmail } from "firebase/auth";
//import { auth} from '../../utils/firebase.js';
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import BuildingMap from "../Map/BuildingMap";
import { useUserData } from '../../utils/userDataUtils.js';
import { auth, firestore } from "../../utils/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";


const Profile = () => {

  const navigate = useNavigate();
  const handleHOME = () => {
    navigate("/Homepage");
  };

  const { userData, userId, refetchUserData } = useUserData(); // Reuse userData and userId
  const [rentalCancelled, setRentalCancelled] = useState(false);
  const [AllEvents, setEvents] = useState([]);

 
  const [showLoadKuduPopup, setShowLoadKuduPopup] = useState(false);
  const [selectedBike, setSelectedBike] = useState(null);

  // Handle Rent button click
  const handleEventRent = (ritem, rent) => {
    if (!userId || !userData) {
      console.error("No user data found. Can't proceed with rental.");
      return;
    }

    if (userData.kudu < 10) {
      alert('You need more Kudu Bucks to rent this ride.');
      return;
    }

    axios
      .post(`https://api-campus-transport.vercel.app/event/${userId}/${ritem}/${rent}`)
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
        handleHOME();
      })
      .catch((error) => {
        console.error('Error renting item:', error);
        alert('Error renting item.');
      });
  };

  useEffect(() => {
    // Fetch building data only once, store it in localStorage
    const fetchEvents = async () => {
      try {
        // Check if buildings data already exists in localStorage
        const storedEvents = localStorage.getItem("eventsData");

        if (storedEvents) {
          // If data exists, use it directly
          // console.log("Fetching buildings data from localStorage");
          setEvents(JSON.parse(storedEvents));
        } else {
          // If no data, fetch from Firestore
          // console.log("Fetching buildings data from Firestore");
          const snapshot = await getDocs(collection(firestore, "Events"));
          let eventData = [];
          snapshot.forEach((doc) => {
            eventData.push({ id: doc.id, ...doc.data() }); // Use document ID as the building name
          });

          // Set the data in state and store it in localStorage
          setEvents(eventData);
          localStorage.setItem("eventsData", JSON.stringify(eventData));
        }
      } catch (error) {
        // console.error("Error fetching buildings:", error);
      }
    };

    fetchEvents();

    // Clean up localStorage on logout
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        // console.log("User logged out. Clearing localStorage for buildings.");
        localStorage.removeItem("eventsData");
      }
    });

    // Clean up the auth subscription on unmount
    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  // console.log("ID: ", userId);

  const [showForgotPassword, setShowForgotPassword] = useState(false); // Toggle password reset form within the card
  const [showPopup, setShowPopup] = useState(false); 

  useEffect(() => {
    // Add class when component mounts
    document.body.classList.add("hide-mapbox-controls");

    // Remove class when component unmounts
    return () => {
      document.body.classList.remove("hide-mapbox-controls");
    };
  }, []);

  // Handle password reset
  const handleForgotPassword = async (e) => {
    e.preventDefault();

    try {
      await sendPasswordResetEmail(auth, userData.email); // Use the email stored in state
      toast.success("Password reset email sent! Check your inbox.");
      setShowForgotPassword(false); // Close the form after sending the email
    } catch (error) {
      toast.error("Error sending password reset email. Please try again.");
    }
  };
  

  // Perform only one fetch, and make operations using the session storage data, instead of fetching from firestore
  useEffect(() => {
    // If rentalCancelled is true, refetch user data
    if (rentalCancelled) {
      refetchUserData();
      setRentalCancelled(false); // Reset after refetching
    }
  }, [rentalCancelled, refetchUserData]);


  const handleRentClick = (vehicle) => {
    setSelectedBike(vehicle);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedBike(null);
  };

  const getKuduColor = (kudu) => {
    if (kudu >= 70) {
      return 'green';
    } else if (kudu >= 20) {
      return `rgb(${255 - (kudu - 20) * 2}, 255, 0)`; // Gradually decrease red component
    } else {
      return `rgb(255, ${(kudu / 20) * 255}, 0)`; 
    }
  };

  return (
    <div className="Profile-container map-back">
      
      <div className="back">
        <BuildingMap />
      </div>
     

      <div className="front">
        <SideMenu />
        <div>

          {/* Profile Card */}
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-picture">
                <FaUser className="ProfileIcon1" />
              </div>
              <div className="profile-info">
                <h2>Hello</h2>
                <p className="name">{userData.lastName}</p>
                <p className="name">{userData.email}</p>
                {/* Change Password Link */}
                <div className="change">
                  <a href="#" onClick={() => setShowForgotPassword(true)}>
                    Change password
                  </a>
                </div>
              </div>
              <div className="profile-stats">
                  <div className="stat-item">
                    <h3 style={{ color: getKuduColor(userData.kudu) }}>{userData.kudu}</h3>
                    <p>KuduBucks</p>
                  </div>
                </div>
            </div>

            {!showForgotPassword ? (
              <>
                {/* Profile Stats
                <div className="profile-stats">
                  <div className="stat-item">
                    <h3>{kudu}</h3>
                    <p>KuduBucks</p>
                  </div>
                  <div className="stat-item">
                    <h3>23</h3>
                    <p>Vehicles Available</p>
                  </div>
                </div> */}
                <div className="divider"></div>
                <div className="rent-history">
                <h4 className="currentRentalHeading">Current Rental</h4>
                  <div className="bicycle-item">
                    <h3>{userData && userData.item ? userData.item : 'No current rental'}</h3>
                    <p>
                      Pickup: {userData && userData.location ? userData.location : 'No pickup available'}
                    </p>
                    
                  </div>
                </div>

                {/* Other events from the external API mock */}
                <div className="events">
                  <h4>Events That May Interest You.</h4>
                  <div className="event-list">
                    <ul>
                      {AllEvents.map((event, index) => (
                        <div className="event" key={index}>
                          <li key={index}>
                          <h4>{event.name}</h4>
                          <p>{event.description} Available: {event.Vehicle}</p>
                          {/* <li key={index}>{event["name"]}</li> */}
                          <a
                            href="#"
                            className="rent-link"
                            onClick={() => handleRentClick(event)}
                            style={{ display: !userData.location ? 'block' : 'none' }}
                          >
                            Rent
                          </a>                          
                          </li>
                        </div>
                      ))}
                    </ul>
                  </div>
                </div>
                {/* Other events from the external API mock */}
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
                              handleEventRent(selectedBike?.id, selectedBike?.location);
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
                
              </>
            ) : (
              <>
                {/* Reset Password Form inside the card */}
                <form onSubmit={handleForgotPassword} className="reset">
                  <h2>Reset Password</h2>
                  <p>A reset link will be sent to your email: {userData.email}</p>
                  <button type="submit" className="btn-">
                    Send Reset Email
                  </button>
                  <br />
                  <br />
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="btn-"
                  >
                    Cancel
                  </button>
                </form>
              </>
            )}
           
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Profile;