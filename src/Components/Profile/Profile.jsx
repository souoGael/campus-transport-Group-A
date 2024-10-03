import React, { useEffect, useState } from "react";
import "./Profile.css";
import SideMenu from "../SideMenu/SideMenu";
import SearchBar from "../SearchBar/SearchBar";
import { FaUser } from "react-icons/fa";
import axios from "axios";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth, firestore } from '../../utils/firebase.js';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import BuildingMap from "../Map/BuildingMap";

const Profile = () => {
  const navigate = useNavigate();
  const handleHOME = () => {
    navigate("/Homepage");
  };

  const [fullName, setFullName] = useState("John Doe"); // Default to "John Doe" for now
  const [email, setEmail] = useState("John@gmail.com"); // Existing email
  const [kudu, setKudu]=useState(0)
  const [UID, setUserId] = useState(null);
  const [rental, setRental] = useState([]);
  const [userData, setUserData] = useState(null);
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

  // Get data
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in, set the user ID
        setUserId(user.uid);
        // console.log('User ID:', user.uid);
        // Fetch user document to check if location exists
        const userRef = doc(firestore, 'Users', user.uid);
        getDoc(userRef).then((docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUserData(userData); // Set user's location
            setEmail(userData.email);
            setKudu(userData.kudu)
            setFullName(`${userData.firstName} ${userData.lastName}`);
            
          } 
        })
      } else{
        setUserId(null);
        setUserData(null); // Reset user location
      }
    });

    // Clean up subscription on unmount
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Handle password reset
  const handleForgotPassword = async (e) => {
    e.preventDefault();

    try {
      await sendPasswordResetEmail(auth, email); // Use the email stored in state
      toast.success("Password reset email sent! Check your inbox.");
      setShowForgotPassword(false); // Close the form after sending the email
    } catch (error) {
      toast.error("Error sending password reset email. Please try again.");
    }
  };
  
  // Handle Rent button click
  const cancelRent = (ritem) => {
   
    if (kudu < 10) {
      toast.error("You need more Kudu Bucks to rent this ride.");
      handleClosePopup();
      return;
    }

    axios
      .post(`https://api-campus-transport.vercel.app/cancel-rent/${UID}/${ritem}`)
      .then((response) => {
        // console.log('Rental successful:', response.data);
        handleHOME();
        const newKuduBalance = kudu + 10;
        setKudu(newKuduBalance); // Update the local state

        const userRef = doc(firestore, 'Users', UID);
        updateDoc(userRef, {
          kudu: newKuduBalance,
        })
        .then(() => {
          
        })
        .catch((error) => {
          
        });

        toast.success("Rental cancellation successful!");
        handleClosePopup();
      })
      .catch((error) => {
        // console.error('Error canceling rental:', error);
        toast.error("Error canceling rental.");
      });
  };


  const handleCancel = () => {
    setUserData(null);
  };

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
          <SearchBar id="busSearch" />

          {/* Profile Card */}
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-picture">
                <FaUser className="ProfileIcon1" />
              </div>
              <div className="profile-info">
                <h2>Hello</h2>
                <p className="name">{fullName}</p>
                <p className="name">{email}</p>
                {/* Change Password Link */}
                <div className="change">
                  <a href="#" onClick={() => setShowForgotPassword(true)}>
                    Change password
                  </a>
                </div>
              </div>
              <div className="profile-stats">
                  <div className="stat-item">
                    <h3 style={{ color: getKuduColor(kudu) }}>{kudu}</h3>
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
                    {userData && userData.item && userData.location && (
                      <a
                        className="cancel-link"
                        onClick={() => cancelRent(userData.item)}
                      >
                        Cancel Rental
                      </a>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Reset Password Form inside the card */}
                <form onSubmit={handleForgotPassword} className="reset">
                  <h2>Reset Password</h2>
                  <p>A reset link will be sent to your email: {email}</p>
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
                  <button 
                  className="cancelBtn" 
                  // onClick={handleClosePopup}
                    // className="rentBtn" 
                     onClick={handleCancel}
                  >
                    Cancel
                  </button>
                

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