import React, { useState, useEffect } from 'react';
import './EmergencyAlert.css'; // Import CSS for styling

const Popup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [currentPlace, setCurrentPlace] = useState('');

  // List of places
  const places = [
    'MSL',
    'The matrix',
    'Cafeteria',
    'Lab 101',
    'Gymnasium',
    'Auditorium',
    'Parking Lot A',
    'Conference Room B',
  ];

  useEffect(() => {
    // Function to check the time
    const checkTime = () => {
      const currentTime = new Date();
      const currentHours = currentTime.getHours();
      const currentMinutes = currentTime.getMinutes();

      // Define the specific times when the popup should appear
      const specificTimes = [
        { hours: 16, minutes: 23 },
        { hours: 6, minutes: 10 }
      ];

      // Check if the current time matches any of the specific times
      const isPopupTime = specificTimes.some(time => 
        time.hours === currentHours && time.minutes === currentMinutes
      );

      if (isPopupTime) {
        // Randomly select a place from the list
        const randomPlace = places[Math.floor(Math.random() * places.length)];
        setCurrentPlace(randomPlace);
        setShowPopup(true);
      }
    };

    // Check the time every minute
    const intervalId = setInterval(checkTime, 60000);
    checkTime(); // Run the check immediately on mount

    return () => clearInterval(intervalId);
  }, [places]);

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
            <p>There's an emergency at {currentPlace}, please evacuate the premises immediately.</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Popup;
