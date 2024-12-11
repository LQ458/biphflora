import React, { useEffect, useState } from "react";
import axios from "axios";
import { ReactComponent as PreviousIcon } from "../src/buttons/caret-back-outline.svg";
import { ReactComponent as NextIcon } from "../src/buttons/caret-forward-outline.svg";
import styles from "../styles/home.module.css";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.js";
import SearchBar from "../components/SearchBar.js";
import SearchPlant from "../components/SearchPlant.js";

const Home = ({ handleGets }) => {
  const navigate = useNavigate();
  const [plants, setPlants] = useState([]); // [plant1, plant2, plant3, ...
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState("");
  const [featuredPicsArray, setFeaturedPicsArray] = useState([]);
  const [currentPic, setCurrentPic] = useState();
  const [artPaths, setArtPaths] = useState([]);
  const [picsArrayIndex, setPicsArrayIndex] = useState(0);
  const [query, setQuery] = useState("");
  const [namesArray, setNamesArray] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  const handleGet = (search) => {
    handleGets(search);
    navigate("/search");
  };

  useEffect(() => {
    document.title = "BIPH FLORA 识草木";
  }, []);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.REACT_APP_Source_URL}/userInfo`,
        );
        setUsername(response.data.username);
        setAdmin(response.data.admin);
        setFeaturedPicsArray(
          response.data.featureLists.map((work) => {
            return work.works.pic.path;
          }),
        );
        setArtPaths(
          response.data.featureLists.map((work) => {
            return work.works.art.path;
          }),
        );
        setPlants(
          response.data.featureLists
            .map((work) => {
              const plant = work.works.pic;
              const art = work.works.art;
              if (plant && art) {
                return {
                  plant: plant.plant,
                  season: plant.season,
                  takenBy: plant.takenBy,
                  time: plant.time,
                  setting: plant.location,
                  postingtime: plant.time,
                  location: art.location,
                  artist: art.artist,
                };
              }
              return null;
            })
            .filter(Boolean),
        );
        if (response.data.featureLists.length > 0) {
          setLoading(false);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []); //fecth data from the server

  useEffect(() => {
    if (featuredPicsArray.length > 0) {
      setCurrentPic(featuredPicsArray[0]);
    }
  }, [featuredPicsArray]);

  const handlePrevious = () => {
    if (picsArrayIndex > 0) {
      setPicsArrayIndex(picsArrayIndex - 1);
    }
  };

  const handleNext = () => {
    if (picsArrayIndex < featuredPicsArray.length - 1) {
      setPicsArrayIndex(picsArrayIndex + 1);
    }
  };

  useEffect(() => {
    if (featuredPicsArray.length > 0) {
      setCurrentPic(featuredPicsArray[picsArrayIndex]);
    }
  }, [picsArrayIndex, featuredPicsArray]);

  // const logout = () => {
  //   localStorage.removeItem("token");
  //   window.location.reload();
  // };

  // log out function for possible usage
  return (
    <section className={styles.home}>
      <div id="page-container">
        <div className={styles.part1}>
          <Navbar />
          <nav className={styles.featureBox}>
            <div className={styles.featuredTopBar}>
              <h4 className={styles.plantInBloom}>Plant in Bloom</h4>
            </div>
            <div className={styles.featuredColumn}>
              <div className={styles.featuredPics}>
                <button className={styles.prevBtn} onClick={handlePrevious}>
                  <PreviousIcon width={70} height={70} />
                </button>
                <div className={styles.posts} id="posta">
                  {loading ? (
                    <div className={styles.picLoad}>
                      <div
                        style={{
                          height: "19vw",
                          width: "36vw",
                          backgroundColor: "rgba(185, 185, 185, 0.7)",
                        }}
                      />
                      <div className={styles.picLabelLoad} />
                    </div>
                  ) : (
                    currentPic && (
                      <div className={styles.picContainer}>
                        <img
                          src={currentPic}
                          alt="PlantPic"
                          className={styles.currentPics}
                        />

                        <div className={styles.currentPicLabel}>
                          <p>
                            Photographer:{" "}
                            {plants[picsArrayIndex]?.takenBy ?? "Unknown"}
                          </p>
                          <p>
                            Time: {plants[picsArrayIndex]?.time ?? "Unknown"}
                          </p>
                          <p>
                            Setting:{" "}
                            {plants[picsArrayIndex]?.setting ?? "Unknown"}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
                <div className={styles.posts} id="posta">
                  {loading ? (
                    <div className={styles.artLoad}>
                      <div
                        style={{
                          height: "25.5vw",
                          width: "18.5vw",
                          backgroundColor: "rgba(185, 185, 185, 0.7)",
                        }}
                      />
                      <div className={styles.artLabelLoad} />
                    </div>
                  ) : (
                    artPaths[picsArrayIndex] && (
                      <div className={styles.artContainer}>
                        <img
                          src={artPaths[picsArrayIndex]}
                          alt="PlantArt"
                          className={styles.currentArts}
                        />
                        <div className={styles.artLabel}>
                          <p style={{ margin: "0", marginLeft: "8px" }}>
                            By {plants[picsArrayIndex]?.artist ?? "Unknown"}
                          </p>
                          <p style={{ margin: "0", marginLeft: "8px" }}>
                            {plants[picsArrayIndex]?.postingtime ?? "Unknown"}
                          </p>
                          <p style={{ margin: "0", marginLeft: "8px" }}>
                            Location:{" "}
                            {plants[picsArrayIndex]?.location ?? "Unknown"}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
                <button className={styles.nextBtn} onClick={handleNext}>
                  <NextIcon width={70} height={70} />
                </button>
              </div>
              <div className={styles.description}>
                <div className={styles.descriptionContainer}>
                  <div className={styles.descriptionLeft}>
                    <h2 className={styles.descriptionH2}>
                      Scientific Name:&nbsp;
                      <p>{currentPic && plants[picsArrayIndex]?.plant}</p>
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        if (plants[picsArrayIndex]?.plant) {
                          handleGet(plants[picsArrayIndex].plant);
                        }
                      }}
                      className={styles.forDetail}
                    >
                      Detailed Information
                    </button>
                  </div>
                  <h2 className={styles.descriptionH2}>
                    Flowering Season:&nbsp;
                    <p>{currentPic && plants[picsArrayIndex]?.season}</p>
                  </h2>
                </div>
              </div>
            </div>
          </nav>
        </div>
        <div className={styles.part2}>
          <div id="bottomHalf">
            <h1 className={styles.searchtitleHome}>
              校内植物检索 Search for Plant species on Campus
            </h1>
            <SearchBar
              handleGet={handleGet}
              searchResults={searchResults}
              query={query}
              handleSearch={handleSearch}
              barWidth="54%"
            />
          </div>
          <br />
          <br />
          <div className={styles.hline2} />
        </div>
        <div className={styles.activity}>
          <div className={styles.activityBox}>
            <div className={styles.activityTop}>
              <div>Recent Activities 近期活动</div>
              <div>Botany Guided Tour Sign-up 植物导赏报名</div>
            </div>
            <div className={styles.activityBtm}>
              <div>
                <img src="./activityPoster.jpg" alt="test" />
              </div>
              <div>
                <iframe
                  width="80%"
                  height="350px"
                  title="form"
                  src="https://forms.office.com/Pages/ResponsePage.aspx?id=4uHGy7umAkC73G2okqBRp7ZfkPP9KsxHgGlnUXrSuIlURVQ3U01SWTJZWldQSFlWUUNJUzIyNExVNC4u&embed=true"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className={styles.contribution}>
          <p>
            Website is constructed by Leo Qin G10 and Jess Chen G10, designed by
            Zoe He G10
          </p>
        </div>
      </div>
    </section>
  );
};

export default Home;
