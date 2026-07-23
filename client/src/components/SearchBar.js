import React from "react";
import { ReactComponent as SearchIcon } from "../src/buttons/search-outline.svg";
import "../styles/searchBar.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { recordSearchAttempt } from "../api/telemetry";

const SearchBar = ({
  handleGet,
  searchResults,
  query,
  handleSearch,
  barWidth,
  placeHolder,
  type,
}) => {
  const [empty, setEmpty] = useState(true);
  const navigate = useNavigate();
  const redirect = (plant) => {
    if (!plant) {
      return;
    }

    //plant的类型是string
    // handleGet(plant);
    if(type === "bird"){
      navigate(`/searchBird/${plant.replaceAll(" ", "_")}`);
    }else{
      navigate(`/search/${plant.replaceAll(" ", "_")}`);
    }
  };
  const recordAndRedirect = (plant) => {
    recordSearchAttempt({
      query,
      resultCount: searchResults.length,
      selected: Boolean(plant),
      catalogType: type === "bird" ? "bird" : "plant",
    });
    redirect(plant);
  };

  return (
    <div className="searchBarDiv">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          recordAndRedirect(searchResults[0]?.[0]);
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
          onKeyDown={(event) => {
            if (event.key === "Enter" && !searchResults[0]) {
              event.preventDefault();
              recordAndRedirect();
            }
          }}
          className="db2SearchBar"
          placeholder={placeHolder}
          // style = {{placeholder:placeHolder}}
        />
        <button
          type="submit"
          className="db2SearchButton"
          disabled={!searchResults[0]}
          aria-label={
            type === "bird" ? "Search bird database" : "Search plant database"
          }
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
              onClick={() => recordAndRedirect(searchResults[0][0])}
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
              onClick={() => recordAndRedirect(searchResults[1][0])}
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
              onClick={() => recordAndRedirect(searchResults[2][0])}
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
