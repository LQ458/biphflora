import React from "react";
import { ReactComponent as SearchIcon } from "./buttons/search-outline.svg";
import "./searchBar.css";
import { useState } from "react";

const SearchBar = ({
  handleGet,
  searchResults,
  query,
  handleSearch,
  barWidth,
}) => {
  const [empty, setEmpty] = useState(true);

  return (
    <div className="searchBarDiv">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleGet(searchResults[0][0]);
        }}
        style={{ width: barWidth }}
        className="db2SubmitForm"
      >
        <input
          type="text"
          value={query}
          onChange={(event) => {
            handleSearch(event);
            setEmpty(event.target.value === "");
          }}
          placeholder="Enter the name of the plant 输入植物名......"
          className="db2SearchBar"
        />
        <button
          type="submit"
          className="db2SearchButton"
          disabled={!searchResults[0]}
        >
          <SearchIcon width={30} height={30} />
        </button>
      </form>

      {!empty && (
        <div className="db2Results" style={{ width: barWidth }}>
          {searchResults[0] && (
            <button
              id="buttonOne"
              className="searchResultsButton"
              onClick={(e) => handleGet(searchResults[0][0])}
            >
              <h2 className="db1h2">
                {searchResults[0][0] +
                  " " +
                  searchResults[0][1] +
                  " " +
                  searchResults[0][2]}
              </h2>
            </button>
          )}
          {searchResults[1] && (
            <button
              id="buttonTwo"
              className="searchResultsButton"
              onClick={(e) => handleGet(searchResults[1][0])}
            >
              <h2 className="db1h2">
                {searchResults[1][0] +
                  " " +
                  searchResults[1][1] +
                  " " +
                  searchResults[1][2]}
              </h2>
            </button>
          )}
          {searchResults[2] && (
            <button
              id="buttonThree"
              className="searchResultsButton"
              onClick={(e) => handleGet(searchResults[2][0])}
            >
              <h2 className="db1h2">
                {searchResults[2][0] +
                  " " +
                  searchResults[2][1] +
                  " " +
                  searchResults[2][2]}
              </h2>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
