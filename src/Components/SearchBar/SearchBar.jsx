import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SearchBar.css";
import { FaSearch } from "react-icons/fa";
import { MdClear } from "react-icons/md";
import { auth, firestore } from "../../utils/firebase";
import { collection, getDocs } from "firebase/firestore";

const SearchBar = ({ onQueryChange, forceShowDropdown = false  }) => {
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const [showDropdown, setShowDropdown] = useState(forceShowDropdown);
  const [descriptionData, setDescriptionData] = useState(null);
  const [buildings, setBuildings] = useState([]);
  const [filteredSearches, setFilteredSearches] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  useEffect(() => {
    // If `forceShowDropdown` changes, update the state accordingly
    if (forceShowDropdown) {
      setShowDropdown(true);
    }
  }, [forceShowDropdown]);


  useEffect(() => {
    // Fetch building data only once, store it in localStorage
    const fetchBuildings = async () => {
      try {
        // Check if buildings data already exists in localStorage
        const storedBuildings = localStorage.getItem("buildingsData");

        if (storedBuildings) {
          // If data exists, use it directly
          // console.log("Fetching buildings data from localStorage");
          setBuildings(JSON.parse(storedBuildings));
        } else {
          // If no data, fetch from Firestore
          // console.log("Fetching buildings data from Firestore");
          const snapshot = await getDocs(collection(firestore, "Buildings"));
          let buildingsData = [];
          snapshot.forEach((doc) => {
            buildingsData.push({ id: doc.id, ...doc.data() }); // Use document ID as the building name
          });

          // Set the data in state and store it in localStorage
          setBuildings(buildingsData);
          localStorage.setItem("buildingsData", JSON.stringify(buildingsData));
        }
      } catch (error) {
        // console.error("Error fetching buildings:", error);
      }
    };

    fetchBuildings();

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

  const handleInputChange = (event) => {
    const value = event.target.value;
    setQuery(value);
    onQueryChange(value);

    if (value.trim() !== "") {
      // Filter buildings based on query
      const filtered = buildings.filter(
        (building) =>
          building.id.toLowerCase().includes(value.toLowerCase()) ||
          (building["other-names"] &&
            building["other-names"].toLowerCase().includes(value.toLowerCase()))
      );
      setFilteredSearches(filtered);
      setShowDropdown(true);
    } else {
      setFilteredSearches([]);
      setShowDropdown(false);
    }
  };

  const handleClearClick = () => {
    setQuery("");
    setDescriptionData(null);
    setShowDropdown(false);
    setFilteredSearches([]);
    setSelectedBuilding(null);
    onQueryChange("");
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const lowerQuery = query.toLowerCase();

    const matchedBuilding = buildings.find(
      (building) =>
        building.id.toLowerCase() === lowerQuery ||
        (building["other-names"] &&
          building["other-names"].toLowerCase() === lowerQuery)
    );

    if (matchedBuilding) {
      setDescriptionData({
        text: matchedBuilding.description || "No description available",
        image: matchedBuilding.image || null,
        side: matchedBuilding.side || "No side information",
      });
      setSelectedBuilding({
        latitude: matchedBuilding.latitude,
        longitude: matchedBuilding.longitude,
      });

      // Add to recent searches if not already present
      if (!recentSearches.some((term) => term.toLowerCase() === lowerQuery)) {
        setRecentSearches([matchedBuilding.id, ...recentSearches]);
      }
    } else {
      setDescriptionData({
        text: "No description available for this search.",
        image: null,
      });
      setSelectedBuilding(null);
    }

    setShowDropdown(false);
  };

  const handleFocus = () => {
    if (query.trim() !== "") {
      setShowDropdown(true);
    }
  };

  const handleSearchSelect = (searchTerm) => {
    setQuery(searchTerm);
    setShowDropdown(false);

    const matchedBuilding = buildings.find(
      (building) =>
        building.id.toLowerCase() === searchTerm.toLowerCase() ||
        (building["other-names"] &&
          building["other-names"].toLowerCase() === searchTerm.toLowerCase())
    );

    if (matchedBuilding) {
      setDescriptionData({
        text: matchedBuilding.description || "No description available",
        image: matchedBuilding.image || null,
        side: matchedBuilding.side || "No side information",
      });
      setSelectedBuilding({
        latitude: matchedBuilding.latitude,
        longitude: matchedBuilding.longitude,
      });
    }
  };

  const handleGetDirectionsClick = () => {
    if (selectedBuilding) {
      const event = new CustomEvent("getDirections", {
        detail: {
          latitude: selectedBuilding.latitude,
          longitude: selectedBuilding.longitude,
        },
      });
      window.dispatchEvent(event);
    }
  };

  return (
    <div className="search-bar-container">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder="Search"
          className="search-input"
        />
        <button type="submit" className="search-icon-button">
          <FaSearch className="search-icon" />
        </button>

        {query && <MdClear className="clear-icon" data-testid="clear-icon" onClick={handleClearClick} />}
      </form>

      {query.trim() !== "" && showDropdown && filteredSearches.length > 0 && (
        <div className="overlay" data-testid="search-dropdown">
          <ul className="recent-searches-dropdown">
            {filteredSearches.map((building, index) => (
              <li
                key={index}
                className="recent-search-item"
                onClick={() => handleSearchSelect(building.id)}
                tabIndex={0}
              >
                {building.id}
              </li>
            ))}
          </ul>
        </div>
      )}

      {descriptionData && (
        <div className="overlay">
          <div className="search-result-card">
            <h3 className="header1">Search Result for "{query}":</h3>
            {descriptionData.image && (
              <img
                src={descriptionData.image}
                alt={query}
                className="search-description-image"
              />
            )}
            <p className="description1">{descriptionData.text}</p>
            <p className="description1">Side: {descriptionData.side}</p>
            {selectedBuilding && (
              <button
                onClick={handleGetDirectionsClick}
                className="get-directions-button"
                style={{
                  width: "50%",
                  padding: "10px",
                  margin: "15px 0px",
                  backgroundColor: "#4285F4",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Get Directions
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
