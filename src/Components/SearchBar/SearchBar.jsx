import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SearchBar.css";
import { FaSearch } from "react-icons/fa";
import { MdClear } from "react-icons/md";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState([
    "MSL",
    "The Matrix",
    "Solomon Mahlangu",
    "Great Hall",
  ]); // Example recent searches
  const [showDropdown, setShowDropdown] = useState(false); // For controlling the dropdown visibility
  const [descriptionData, setDescriptionData] = useState(false); // State for displaying search result
  const navigate = useNavigate();
  const hide = document.querySelector(".turn-by-turn");

  const searchDescriptions = {
    MSL: {
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXNUEk8yHGxhMEEZgxHAg2RP0ko2BRQlrcVeSoe7GZ1KkVRXwJchwmRCpS6rvID18EsbI&usqp=CAU",
      text: "MSL stands for Mars Science Laboratory, a NASA mission that successfully landed the Curiosity rover on Mars in 2012.",
    },
    "The Matrix": {
      text: "The Matrix is a 1999 science fiction film directed by the Wachowskis, depicting a dystopian future where humanity is unknowingly trapped inside a simulated reality.",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCL7CyPRgbx1mbh8cNN4Cu-2sMMg4ca8YdNw&s",
    },
    "Solomon Mahlangu": {
      text: "Solomon Mahlangu was a South African struggle icon, executed in 1979 at the age of 22 for his fight against apartheid.",
      image: "https://example.com/mahlangu-image.jpg",
    },
    "Great Hall": {
      text: "The Great Hall is a significant venue at universities, often used for ceremonies and events like graduations and exams.",
      image: "https://example.com/greathall-image.jpg",
    },
  };

  const handleInputChange = (event) => {
    setQuery(event.target.value);
    setDescriptionData(null);
  };

  const handleClearClick = () => {
    setQuery("");
    setDescriptionData(null);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    console.log("Searching for:", query);

    const lowerQuery = query.toLowerCase(); // Convert query to lowercase for searching

    // Add the search term to recent searches if it's not already in the list
    const matchedDescription =
      searchDescriptions[
        Object.keys(searchDescriptions).find(
          (key) => key.toLowerCase() === lowerQuery
        )
      ];

    setDescriptionData(
      matchedDescription || { text: "No description available for this search.", image: null }
    );

    if (query && !recentSearches.some((term) => term.toLowerCase() === lowerQuery)) {
      setRecentSearches([query, ...recentSearches]);
    }

    setDescriptionData(
      searchDescriptions[query] || {
        text: "No description available for this search.",
        image: null,
      }
    );

    setShowDropdown(false); // Close the dropdown after searching
    const hide = document.querySelector(".turn-by-turn");
    if (hide) {
      hide.style.display = "block";
    }
  };

  const handleFocus = () => {
    setShowDropdown(true); // Show the dropdown when focused
    const hide = document.querySelector(".turn-by-turn");
    if (hide) {
      hide.style.display = "none";
    }
  };

  const handleSearchSelect = (searchTerm) => {
    setQuery(searchTerm); // Set the original case of the selected term
    setShowDropdown(false); // Hide the dropdown after selecting a search
    const hide = document.querySelector(".turn-by-turn");
    if (hide) {
      hide.style.display = "block";
    }
    setDescriptionData(
      searchDescriptions[searchTerm] || {
        text: "No description available for this search.",
        image: null,
      }
    );
  };

  const handleBlur = () => {
    setShowDropdown(false);
    const hide = document.querySelector(".turn-by-turn");
    if (hide) {
      hide.style.display = "block";
    }
  };

  // Filter recent searches based on the query (case-insensitive)
  const filteredSearches = recentSearches.filter((search) =>
    search.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="search-bar-container" onBlur={handleBlur}>
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

      {/* Full-screen overlay to hide page content when dropdown is visible */}
      {showDropdown && (
        <div className="overlay">
          <ul className="recent-searches-dropdown">
            {filteredSearches.map((search, index) => (
              <li
                key={index}
                className="recent-search-item"
                onClick={() => handleSearchSelect(search)}
              >
                {search}
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
          </div>
        </div>
      )}
    </div>
  );
};
//hello
export default SearchBar;
