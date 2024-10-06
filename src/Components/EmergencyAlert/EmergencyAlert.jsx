import React, { useState, useEffect } from 'react';
import './EmergencyAlert.css'; // Import CSS for styling

const Popup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // Function to fetch the first alert from the API
  const fetchAlert = async () => {
    try {
      const response = await fetch('https://polite-pond-04aadc51e.5.azurestaticapps.net/api/alerts');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Extract the first alert message
      const firstAlertKey = Object.keys(data)[0];  // Get the key of the first alert
      const firstAlert = data[firstAlertKey];      // Access the first alert by key

      // Set the alert message
      setAlertMessage(firstAlert.message);         // Use the "message" from the first alert
      setShowPopup(true);                          // Trigger the popup to show the message

    } catch (error) {
      console.error("Error fetching alerts:", error);
      setAlertMessage("Error fetching emergency alerts.");
    }
  };

  useEffect(() => {
    // Function to check the time
    const checkTime = () => {
      const currentTime = new Date();
      const currentHours = currentTime.getHours();
      const currentMinutes = currentTime.getMinutes();

      // Define the specific times when the popup should appear
      const specificTimes = [
        { hours: 16, minutes: 31 },
        { hours: 6, minutes: 10 }
      ];

      // Check if the current time matches any of the specific times
      const isPopupTime = specificTimes.some(time => 
        time.hours === currentHours && time.minutes === currentMinutes
      );

      if (isPopupTime) {
        fetchAlert(); // Fetch the alert message when it's popup time
      }
    };

    // Check the time every minute
    const intervalId = setInterval(checkTime, 60000);
    checkTime(); // Run the check immediately on mount

    return () => clearInterval(intervalId);
  }, []);

  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    <>
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <span className="close" onClick={closePopup}>&times;</span>
            <h2>Emergency Alert 🚨</h2>
            <p>{alertMessage}</p> {/* Display the fetched alert message */}
          </div>
        </div>
      )}
    </>
  );
};

export default Popup;
