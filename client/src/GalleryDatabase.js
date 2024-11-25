import axios from "axios";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import "./galleryDatabase.css";
import SearchBar from "./SearchBar.js";
import SearchPlant from "./SearchPlant.js";

const GalleryDatabase = (props) => {
  const seasons = ["spring", "summer", "autumn", "winter"];
  const [curIndex, setCurIndex] = useState(0);
  const [username, setUsername] = useState("");
  const [admin, setAdmin] = useState("");
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [namesArray, setNamesArray] = useState([]);
  const [pics, setPics] = useState([]);
  const [displays, setDisplays] = useState([true, false, false, false]);
  const [zoomPicLink, setZoomPicLink] = useState("");
  const [featureBtnMsg, setFeatureBtnMsg] = useState("Feature");

  const navigate = useNavigate();

  useEffect(() => {
    const springBtn = document.getElementById("springBtn");
    if (springBtn) {
      springBtn.focus();
    }
  }, []);

  const zoom = (input) => {
    setZoomPicLink(input);
  };

  const change = (season) => {
    setCurIndex(0);
    const newDisplays = seasons.map(() => false);
    newDisplays[seasons.indexOf(season)] = true;
    setDisplays(newDisplays);
  };

  useEffect(() => {
    const plant = props.customKey;
    const getPics = async () => {
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_Source_URL}/getPics`,
          { plant: plant },
        );
        let newArray = [];
        seasons.map((season, index) => {
          newArray[index] = response.data[`${season}Pics`];
        });
        setPics(newArray);
      } catch (error) {
        console.log(error);
      }
    };
    getPics();
  }, [props.customKey, seasons]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_Source_URL}/searchNames`,
        );
        const fetchedNamesArray = response.data.returnNames;
        setNamesArray(fetchedNamesArray);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  const handleBack = () => {
    props.handleBack(props.customKey);
  };

  const handleSearch = (e) => {
    const inputValue = e.target.value;
    setQuery(inputValue);
    const results = SearchPlant(namesArray, inputValue);
    const finalResults = results.slice(0, 3).map((result) => {
      return [
        result.item.latinName,
        result.item.commonName,
        result.item.chineseName,
      ];
    });
    setSearchResults(finalResults);
  };

  const featureSingleHandle = async (input) => {
    try {
      const newFeature = {
        plant: " " + props.customKey,
        path: zoomPicLink,
      };
      await axios.post(
        `${process.env.REACT_APP_Source_URL}/uploadFeatureSingle`,
        newFeature,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_Source_URL}/userInfo`,
        );
        setUsername(response.data.username);
        setAdmin(response.data.admin);
      } catch (error) {
        console.log(error);
      }
    };

    fetchUserInfo();
  }, []);

  return (
    <body>
      <div className="topbar">
        <div style={{ flexGrow: "1", alignContent: "center" }}>
          <SearchBar
            handleGet={props.gallerySearch}
            searchResults={searchResults}
            query={query}
            handleSearch={handleSearch}
            barWidth="80%"
          />
        </div>
        <div className="ttl">
          <h3 className="db1T">
            Name: <em>{props.customKey}</em>
          </h3>
        </div>
      </div>
      <div className="lowerPart">
        <button onClick={handleBack} className="backBtn">
          Back
        </button>
        <h1 className="lowerTitle">Image Gallery图库</h1>
        <div className="seasons">
          <button
            id="springBtn"
            className="seasonBtn"
            onClick={() => change("spring")}
          >
            Spring
          </button>
          <div className="lineB" />
          <button className="seasonBtn" onClick={() => change("summer")}>
            Summer
          </button>
          <div className="lineB" />
          <button className="seasonBtn" onClick={() => change("autumn")}>
            Autumn
          </button>
          <div className="lineB" />
          <button className="seasonBtn" onClick={() => change("winter")}>
            Winter
          </button>
        </div>
        <div className="underSeasons">
          <button
            id="springBtn"
            className="seasonBtn"
            onClick={() => change("spring")}
          >
            Spring
          </button>
          <div className="lineB" />
          <button className="seasonBtn" onClick={() => change("summer")}>
            Summer
          </button>
        </div>
        {pics.map(
          (pic, index) =>
            displays[index] && (
              <>
                <div className="summerPics" key={index}>
                  {pic
                    .slice(curIndex * 12, (curIndex + 1) * 12)
                    .map((p, index) => (
                      <div className="summerPic">
                        <img
                          key={index}
                          src={p.path}
                          alt=""
                          className="summerPic"
                          onClick={() => zoom(p.path)}
                        />
                        <div className="summerPicWords">
                          <p className="SPW">
                            {p.takenBy} {p.time} {p.description}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
                {pic.length > 12 && (
                  <div className="pageBtns">
                    {Array.from(
                      { length: Math.ceil(pic.length / 12) },
                      (_, i) => (
                        <button
                          key={i}
                          className={`pageBtn ${i === curIndex ? "pageBtnA" : ""}`}
                          onClick={() => setCurIndex(i)}
                        >
                          {i + 1}
                        </button>
                      ),
                    )}
                  </div>
                )}
              </>
            ),
        )}
      </div>
      <div className="btmLine" />
      <div className="zoomPicBox">
        {zoomPicLink && (
          <div className="zoomBox">
            <img className="zoomPic" src={zoomPicLink} alt={zoomPicLink} />
            <button
              className="xButton"
              onClick={() => {
                setZoomPicLink();
              }}
            >
              X
            </button>
            {username && zoomPicLink && (
              <button
                className="featureBtn"
                onClick={() => {
                  featureSingleHandle(zoomPicLink);
                }}
              >
                {featureBtnMsg}
              </button>
            )}
          </div>
        )}
        {zoomPicLink && <img src={zoomPicLink} alt={zoomPicLink} />}
        {zoomPicLink && (
          <button
            onClick={() => {
              setZoomPicLink();
            }}
          >
            X
          </button>
        )}
        {username && zoomPicLink && (
          <button
            onClick={() => {
              featureSingleHandle(zoomPicLink);
            }}
          >
            Feature
          </button>
        )}
      </div>
    </body>
  );
};

export default GalleryDatabase;
