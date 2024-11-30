import axios from "axios";
import React, { useState, useEffect, useMemo } from "react";
import styles from "./galleryDatabase.module.css";
import SearchBar from "./SearchBar.js";
import SearchPlant from "./SearchPlant.js";

const GalleryDatabase = (props) => {
  const seasons = useMemo(() => ["spring", "summer", "autumn", "winter"], []);
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
    <body className={styles.db}>
      <div className={styles.topbarGalleryDB}>
        <div style={{ flexGrow: "1", alignContent: "center" }}>
          <SearchBar
            handleGet={props.gallerySearch}
            searchResults={searchResults}
            query={query}
            handleSearch={handleSearch}
            barWidth="80%"
          />
        </div>
        <div className={styles.ttl}>
          <h3>
            Name: <em>{props.customKey}</em>
          </h3>
        </div>
      </div>
      <div className={styles.lowerPart}>
        <button onClick={handleBack} className={styles.backBtn}>
          Back
        </button>
        <h1 className={styles.lowerTitle}>Image Gallery 图库</h1>
        <div className={styles.seasons}>
          <button
            id="springBtn"
            className={styles.seasonBtn}
            onClick={() => change("spring")}
          >
            Spring
          </button>
          <div className={styles.lineB} />
          <button className={styles.seasonBtn} onClick={() => change("summer")}>
            Summer
          </button>
          <div className={styles.lineB} />
          <button className={styles.seasonBtn} onClick={() => change("autumn")}>
            Autumn
          </button>
          <div className={styles.lineB} />
          <button className={styles.seasonBtn} onClick={() => change("winter")}>
            Winter
          </button>
        </div>
        <div className={styles.underSeasons}>
          <button
            id="springBtn"
            className={styles.seasonBtn}
            onClick={() => change("spring")}
          >
            Spring
          </button>
          <div className={styles.lineB} />
          <button className={styles.seasonBtn} onClick={() => change("summer")}>
            Summer
          </button>
        </div>
        {pics.map(
          (pic, index) =>
            displays[index] && (
              <>
                <div className={styles.summerPics} key={index}>
                  {pic
                    .slice(curIndex * 12, (curIndex + 1) * 12)
                    .map((p, index) => (
                      <div className={styles.summerPic} key={index}>
                        <img
                          src={p.path}
                          alt=""
                          className={styles.summerPic}
                          onClick={() => zoom(p.path)}
                        />
                        <div className={styles.summerPicWords}>
                          <p className={styles.SPW}>
                            {p.takenBy} {p.time} {p.description}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
                {pic.length > 12 && (
                  <div className={styles.pageBtns}>
                    {Array.from(
                      { length: Math.ceil(pic.length / 12) },
                      (_, i) => (
                        <button
                          key={i}
                          className={`${styles.pageBtn} ${i === curIndex ? styles.pageBtnA : ""}`}
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
      <div className={styles.btmLine} />
      <div className={styles.zoomPicBox}>
        {zoomPicLink && (
          <div className={styles.zoomBackground}>
            <div className={styles.zoomBox}>
              <img
                className={styles.zoomPic}
                src={zoomPicLink}
                alt={zoomPicLink}
              />
              <button
                className={styles.xButton}
                onClick={() => setZoomPicLink("")}
              >
                X
              </button>
              {username && (
                <button
                  className={styles.featureBtn}
                  onClick={() => featureSingleHandle(zoomPicLink)}
                >
                  {featureBtnMsg}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </body>
  );
};

export default GalleryDatabase;
