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
import { collection, getDocs } from "firebase/firestore";


const Profile = () => {

  const navigate = useNavigate();
  const handleHOME = () => {
    navigate("/Homepage");
  };

  const { userData, userId, refetchUserData } = useUserData(); // Reuse userData and userId
  const [rentalCancelled, setRentalCancelled] = useState(false);
  const [AllEvents, setEvents] = useState([]);


  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Radius of the Earth in meters
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in meters
    return distance;
  }

  // Handle Rent button click
  const handleDropOff = (ritem) => {
    axios
      .post(`https://api-campus-transport.vercel.app/cancel-rent/${userId}/${ritem}`)
      .then((response) => {
        alert('Rental drop-off successful!');

        sessionStorage.removeItem('userData'); // Clear sessionStorage, and the cosole that appers in rentals in for the profile being stored
        refetchUserData();
        //handleProfile();
      })
      .catch((error) => {
        console.error('Error dropping off rental:', error);
        alert('Error dropping off rental.');
      });
  };

  function handleDrop(location) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const distance = calculateDistance(location.lat, location.lng, userLat, userLng);
        console.log("Distance to the drop-off location:", distance);
        if (distance <= 200) {
          handleDropOff("Unallocated");
          toast.success("Drop off successful!");
        } else {
          // alert(`Drop off unsuccessful, too far from the, ${location.id}`)
          toast.error(`Drop off unsuccessful, too far from the, ${location.id}`);
        }
      },
      (error) => {
        toast.error("Unable to retrieve your location.");
      }
    );
  }

  function DropOffRental(event){
    console.log(event);
    handleDrop(event);
  }


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
        localStorage.removeItem("buildingsData");
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
  
  // Handle Rent button click
  const cancelRent = (ritem) => {
    axios
      .post(`https://api-campus-transport.vercel.app/cancel-rent/${userId}/${ritem}`)
      .then(() => {
        handleHOME();
        
        alert("Rental cancellation successful!");
        sessionStorage.removeItem("userData");

        // Reset rentalCancelled after refetch
        setRentalCancelled(true);
        refetchUserData(); // Trigger a refetch of the user data after cancelation
      })
      .catch((error) => {
        // console.error("Error canceling rental:", error);
      });
  };

  // Perform only one fetch, and make operations using the session storage data, instead of fetching from firestore
  useEffect(() => {
    // If rentalCancelled is true, refetch user data
    if (rentalCancelled) {
      refetchUserData();
      setRentalCancelled(false); // Reset after refetching
    }
  }, [rentalCancelled, refetchUserData]);


  // const handleCancel = () => {
  //   setUserData(null);
  // };

  // const handleRentClick = () => {
  //   setShowPopup(true);
  // };

  const handleClosePopup = () => {
    setShowPopup(false);
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
                  <h4>Current Rental</h4>
                  <div className="bicycle-item">
                    <h3>{userData && userData.item ? userData.item : 'No current rental'}</h3>
                    <p>
                      Pickup: {userData && userData.location ? userData.location : 'No pickup available'}
                    </p>

                    {/* Only show the cancel button if the user has a current rental */}
                    {/* {userData && userData.item && userData.location && (
                      <a
                        className="cancel-link"
                        onClick={() => cancelRent(userData.item)}
                      >
                        Cancel Rental
                      </a>
                    )} */}
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
                          <p>{event.description}</p>
                          {/* <li key={index}>{event["name"]}</li> */}
                          <span
                            onClick={() => DropOffRental(event)}
                            style={{ cursor: 'pointer', color: 'blue' }}
                          >
                            End Rental Here.
                          </span>                          
                          </li>
                        </div>
                      ))}
                    </ul>
                  </div>
                </div>
                {/* Other events from the external API mock */}
                
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

            {showPopup && (
            <div className="popup-overlay">
              <div className="popup-content">
                <h4>Cancel Rental</h4>
                <p>
                  Are you sure you want to cancel this item? <br />
                </p>
                  {/* <button 
                  className="cancelBtn" 
                  // onClick={handleClosePopup}
                    // className="rentBtn" 
                     onClick={handleCancel}
                  >
                    Cancel
                  </button> */}
                

                <button className="closeBtn" onClick={handleClosePopup}>Close</button>
              </div>
            </div>
          )}
           
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Profile;