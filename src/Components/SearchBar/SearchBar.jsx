import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SearchBar.css";
import { FaSearch } from "react-icons/fa";
import { MdClear } from "react-icons/md";
import { firestore } from "../../utils/firebase"; // Correct import
import { collection, getDocs } from "firebase/firestore";

const SearchBar = ({ onQueryChange }) => {
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [descriptionData, setDescriptionData] = useState(null);
  const [buildings, setBuildings] = useState([]);
  const [filteredSearches, setFilteredSearches] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch building data from Firestore
    const fetchBuildings = async () => {
      try {
        const snapshot = await getDocs(collection(firestore, "Buildings"));
        let buildingsData = [];
        snapshot.forEach((doc) => {
          buildingsData.push({ id: doc.id, ...doc.data() }); // Use document ID as the building name
        });
        setBuildings(buildingsData);
      } catch (error) {
        // console.error("Error fetching buildings:", error);
      }
    };

    fetchBuildings();
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
        link: `https://www.google.com/maps?q=${matchedBuilding.latitude},${matchedBuilding.longitude}`,
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
        link: `https://www.google.com/maps?q=${matchedBuilding.latitude},${matchedBuilding.longitude}`,
      });
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

        {query && <MdClear className="clear-icon" onClick={handleClearClick} />}
      </form>

      {query.trim() !== "" && showDropdown && filteredSearches.length > 0 && (
        <div className="overlay">
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
            {descriptionData.link && (
              <a
                href={descriptionData.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                Get Directions
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
