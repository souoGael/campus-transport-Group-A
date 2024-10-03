import React, { useEffect, useRef, useState, useCallback } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { MapStyle } from "./MapStyle";
import axios from 'axios';
import { auth, firestore } from '../../utils/firebase.js';
import { doc, getDoc} from "firebase/firestore";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const fallbackLatitude = -26.1893;
const fallbackLongitude = 28.0271;

let rental = [
  {"Vehicle":"Bicycle","id":"Bus-Station","lng":28.0282,"location":"Yale Road, AMIC"," availability":10,"lat":-26.1907},
  {"Vehicle":"Bicycle","id":"rentals","lng":28.025,"location":"WITS Law Lawns","availability":10,"lat":-26.188},
  {"Vehicle":"Bicycle","id":"rentals3","lng":28.028,"location":"Origin Centre","availability":10,"lat":-26.192},
  {"Vehicle":"Skateboards","id":"rentals4","lng":28.025,"location":"WITS SCIENCE STADIUM","availability":10,"lat":-26.191},
  {"Vehicle":"Skateboards","id":"rentals5","lng":28.026,"availability":10,"lat":-26.19,"location":"TW Kambule"},
  {"Vehicle":"Skateboards","id":"rentals7","lng":28.03,"location":"Mens Halls Of Residence","availability":10,"lat":-26.189},
  {"Vehicle":"Skateboards","id":"BB","lng":28.036013,"location":"BB","availability":10,"lat":-26.182666}
]

const BuildingMap = () => {
  const mapRef = useRef(null);
  const [googleMaps, setGoogleMaps] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const [directions, setDirections] = useState(() => {
    const savedDirections = localStorage.getItem("directions");
    return savedDirections ? JSON.parse(savedDirections) : null;
  });
  const [selectedMode, setSelectedMode] = useState("WALKING");
  const [originMarker, setOriginMarker] = useState(null);
  const [destinationMarker, setDestinationMarker] = useState(null);
  const originMarkerRef = useRef(null);
  const destinationMarkerRef = useRef(null);
  const watchIdRef = useRef(null);
  const [isDarkStyle, setIsDarkStyle] = useState(() => {
    const savedStyle = localStorage.getItem("isDarkStyle");
    return savedStyle ? JSON.parse(savedStyle) : true;
  });
  const mapInstanceRef = useRef(null);

  const [userPickup, setUserPickup] = useState("test");
  const [UID, setUserId] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in, set the user ID
        setUserId(user.uid);

        // Fetch user document to check if location and kudu bucks exists
        const userRef = doc(firestore, 'Users', user.uid);
        getDoc(userRef).then((docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUserPickup(userData.location); 
            // console.log('User location:', userData.location);
          } else {
            setUserId(null);
            setUserPickup(null); 
            console.log('No user is logged in');
          }
        }).catch((error) => {
          console.error('Error fetching user document:', error);
        });
      } else {
        // User is signed out
        setUserId(null);
        setUserPickup(null); // Reset user location
        console.log('No user is logged in');
      }
    });

    // Clean up subscription on unmount
    return () => unsubscribe();
  }, []);

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
      .post(`https://api-campus-transport.vercel.app/cancel-rent/${UID}/${ritem}`)
      .then((response) => {
        alert('Rental drop-off successful!');
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
        if (distance <= 500) {
          handleDropOff(location.id);
          // console.log("Drop off successful!");
          toast.success("Drop off successful!");
        } else {
          toast.error("Drop off unsuccessful, too far from the ",location.location," station.");
        }
      },
      (error) => {
        toast.error("Unable to retrieve your location.");
      }
    );
  }


  const calculateRoute = useCallback(
    (origin, destination) => {
      directionsServiceRef.current.route(
        {
          origin: origin,
          destination: destination,
          travelMode: googleMaps.maps.TravelMode[selectedMode],
        },
        (response, status) => {
          if (status === "OK") {
            directionsRendererRef.current.setDirections(response);
            const routeDetails = response.routes[0].legs[0];
            setDirections(routeDetails);
            localStorage.setItem("directions", JSON.stringify(routeDetails));
            if (originMarkerRef.current) {
              originMarkerRef.current.setPosition(routeDetails.start_location);
            }
            if (destinationMarkerRef.current) {
              destinationMarkerRef.current.setPosition(
                routeDetails.end_location
              );
            }
            localStorage.setItem(
              "route",
              JSON.stringify({
                origin: routeDetails.start_location.toJSON(),
                destination: routeDetails.end_location.toJSON(),
              })
            );
          } else {
            console.log("Directions request failed due to " + status);
          }
        }
      );
    },
    [googleMaps, selectedMode]
  );

  const createMarkersAndCalculateRoute = useCallback(
    (originLatLng, destinationLatLng) => {
      if (originMarkerRef.current) originMarkerRef.current.setMap(null);
      if (destinationMarkerRef.current)
        destinationMarkerRef.current.setMap(null);

      const newOriginMarker = new googleMaps.maps.Marker({
        position: originLatLng,
        map: directionsRendererRef.current.getMap(),
        draggable: true,
      });
      const newDestinationMarker = new googleMaps.maps.Marker({
        position: destinationLatLng,
        map: directionsRendererRef.current.getMap(),
        draggable: true,
      });
      setOriginMarker(newOriginMarker);
      setDestinationMarker(newDestinationMarker);
      originMarkerRef.current = newOriginMarker;
      destinationMarkerRef.current = newDestinationMarker;

      localStorage.setItem(
        "route",
        JSON.stringify({
          origin: originLatLng.toJSON(),
          destination: destinationLatLng.toJSON(),
        })
      );

      newOriginMarker.addListener("dragend", () => {
        calculateRoute(
          newOriginMarker.getPosition(),
          newDestinationMarker.getPosition()
        );
      });
      newDestinationMarker.addListener("dragend", () => {
        calculateRoute(
          newOriginMarker.getPosition(),
          newDestinationMarker.getPosition()
        );
      });

      calculateRoute(originLatLng, destinationLatLng);
    },
    [googleMaps, calculateRoute]
  );

  const loadPersistedRoute = useCallback(() => {
    if (googleMaps) {
      const savedRoute = localStorage.getItem("route");
      if (savedRoute) {
        const { origin, destination } = JSON.parse(savedRoute);
        const originLatLng = new googleMaps.maps.LatLng(origin.lat, origin.lng);
        const destinationLatLng = new googleMaps.maps.LatLng(
          destination.lat,
          destination.lng
        );
        createMarkersAndCalculateRoute(originLatLng, destinationLatLng);
      }
    }
  }, [googleMaps, createMarkersAndCalculateRoute]);

  const calculateAndDisplayRoute = useCallback(
    (destination) => {
      if (!userLocation || !googleMaps) {
        alert(
          "Unable to access your location or Google Maps is not loaded. Please try again."
        );
        return;
      }
      const originLatLng = new googleMaps.maps.LatLng(
        userLocation.lat,
        userLocation.lng
      );
      createMarkersAndCalculateRoute(originLatLng, destination);
    },
    [userLocation, googleMaps, createMarkersAndCalculateRoute]
  );

  console.log('User pickup outside: ', userPickup);

  
  
  const addCustomLocationMarkers = useCallback(() => {
    if (googleMaps && mapInstanceRef.current) {
      rental.forEach((i) => {
        if (!i.id || !i.lat || !i.lng || !i.location) {
          console.error("Invalid rental data:", i);
          return; // Skip invalid rental data
        }
        let icon;

        console.log('User pickup inside: ', userPickup);

        // Define custom icons based on location type
        switch (i.id) {
          case "Bus-Station":
            icon = {
              url: "https://img.icons8.com/?size=100&id=rbzJQybQmfOt&format=png&color=000000",
              scaledSize: new googleMaps.maps.Size(50, 50),
            };
            break;
          default:
            icon = {
              url: "https://img.icons8.com/?size=100&id=dUCeRJ9NSaDu&format=png&color=000000",
              scaledSize: new googleMaps.maps.Size(50, 50),
            };
        }


        const marker = new googleMaps.maps.Marker({
          position: { lat: i.lat, lng: i.lng },
          map: mapInstanceRef.current,
          icon: icon,
          title: i.name,
        });

        // Create an info window for each marker
        const infoWindow = new googleMaps.maps.InfoWindow({
          content: `<div>
                      <h3>${i.id}</h3>
                      <p>Lat: ${i.lat}, Lng: ${i.lng}</p>
                      <button 
                        id="dropOffButton-${i.id}" 
                      >
                        Drop-Off rentals
                      </button>
                    </div>`,
        });

        // Add click listener to open info window
        marker.addListener("click", () => {
          infoWindow.open(mapInstanceRef.current, marker);
        });

        // Listen for the 'domready' event to attach the click handler to the button
      googleMaps.maps.event.addListener(infoWindow, 'domready', () => {
        const dropOffButton = document.getElementById(`dropOffButton-${i.id}`);
        if (dropOffButton) {
          dropOffButton.addEventListener("click", () => {
            console.log(`Drop-Off clicked for ${i.id}`);
            handleDrop(i);
          });
        }
      });

      });
    }
  }, [googleMaps, userPickup]);

  useEffect(() => {
    const loader = new Loader({
      apiKey: "AIzaSyB5e2jgdvOEoj4mykJDY-HUDrtW7-NJXUI",
      version: "weekly",
      libraries: ["places"],
    });

    loader
      .load()
      .then((google) => {
        setGoogleMaps(google);
        directionsServiceRef.current = new google.maps.DirectionsService();
        directionsRendererRef.current = new google.maps.DirectionsRenderer({
          suppressMarkers: true,
        });

        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });

            watchIdRef.current = navigator.geolocation.watchPosition(
              (pos) =>
                setUserLocation({
                  lat: pos.coords.latitude,
                  lng: pos.coords.longitude,
                }),
              (error) => console.error("Error watching position:", error),
              { enableHighAccuracy: true, timeout: 20000 }
            );
          },
          (error) => {
            console.error("Error getting initial position:", error);
            setUserLocation({ lat: fallbackLatitude, lng: fallbackLongitude });
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      })
      .catch((error) => console.error("Error loading Google Maps:", error));

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (
      googleMaps &&
      mapRef.current &&
      userLocation &&
      !mapInstanceRef.current
    ) {
      mapInstanceRef.current = new googleMaps.maps.Map(mapRef.current, {
        center: userLocation,
        zoom: 17,
        fullscreenControl: false,
        mapTypeControl: false,
        zoomControl: true,
        streetViewControl: true,
        styles: isDarkStyle ? MapStyle : [],
      });

      directionsRendererRef.current.setMap(mapInstanceRef.current);

      new googleMaps.maps.Marker({
        position: userLocation,
        map: mapInstanceRef.current,
        icon: {
          path: googleMaps.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: "#4285F4",
          fillOpacity: 1,
        },
      });

      window.addEventListener("resize", () =>
        mapInstanceRef.current.setCenter(userLocation)
      );

      loadPersistedRoute();

      addCustomLocationMarkers();

      mapInstanceRef.current.addListener("click", (e) =>
        calculateAndDisplayRoute(e.latLng)
      );
    }
  }, [
    googleMaps,
    userLocation,
    calculateAndDisplayRoute,
    isDarkStyle,
    loadPersistedRoute,
    addCustomLocationMarkers,
  ]);

  const toggleMapStyle = () => {
    setIsDarkStyle((prevIsDarkStyle) => {
      const newIsDarkStyle = !prevIsDarkStyle;
      localStorage.setItem("isDarkStyle", JSON.stringify(newIsDarkStyle));

      if (mapInstanceRef.current && googleMaps) {
        mapInstanceRef.current.setOptions({
          styles: newIsDarkStyle ? MapStyle : [],
        });
      }

      return newIsDarkStyle;
    });
  };

  const recenterMapToUserLocation = () => {
    if (mapInstanceRef.current && userLocation) {
      mapInstanceRef.current.panTo(userLocation);
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

      {directions && (
        <div
          className="turn-by-turn hidden"
          style={{
            position: "absolute",
            top: "90px",
            left: "30px",
            zIndex: "1000",
            background: "white",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 2px6px rgba(0 ,0 ,0 ,0.3)",
            maxHeight: "calc(100vh -120px)",
            overflowY: "auto",
            minWidth: "300px",
            maxWidth: "400px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <h3 style={{ margin: "0" }}>Directions:</h3>
            <select
              value={selectedMode}
              onChange={(e) => {
                setSelectedMode(e.target.value);
                if (directions && originMarker && destinationMarker) {
                  calculateRoute(
                    originMarker.getPosition(),
                    destinationMarker.getPosition()
                  );
                }
              }}
              style={{ padding: "5px" }}
            >
              <option value="WALKING">Walking</option>
              <option value="DRIVING">Driving</option>
              <option value="BICYCLING">Bicycling</option>
              <option value="TRANSIT">Transit</option>
            </select>
          </div>

          <button
            onClick={toggleMapStyle}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "10px",
              backgroundColor: isDarkStyle ? "#aab9c9" : "#1d2c4d",
              color: "white",
              borderRadius: "5px",
            }}
          >
            {isDarkStyle ? "Switch to Light Mode" : "Switch to Dark Mode"}
          </button>

          <button
            onClick={recenterMapToUserLocation}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "10px",
              backgroundColor: "#4285F4",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Recenter Map
          </button>

          <p>Distance: {directions.distance.text}</p>
          <p>Duration: {directions.duration.text}</p>

          <ol style={{ paddingLeft: "30px" }}>
            {directions.steps.map((step, index) => (
              <li
                key={index}
                dangerouslySetInnerHTML={{ __html: step.instructions }}
                style={{ marginBottom: "10px" }}
              ></li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default BuildingMap;