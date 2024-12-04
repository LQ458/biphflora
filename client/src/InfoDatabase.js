import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ReactComponent as PreviousIcon } from "./buttons/caret-back-outline.svg";
import { ReactComponent as NextIcon } from "./buttons/caret-forward-outline.svg";
import React, { useState, useEffect, useContext } from "react";
import styles from "./infoDatabase.module.css";
import { UserContext } from "./UserContext.js";
import SearchBar from "./SearchBar.js";
import SearchPlant from "./SearchPlant.js";

const InfoDatabase = (search) => {
  const { user } = useContext(UserContext);
  const status = user.get("status");
  const admin = user.get("admin");
  const [searchName, setSearchName] = useState(search.search);
  const handleEditPage = search.handleEditPage;
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [namesArray, setNamesArray] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [load, setLoad] = useState(true);
  const [loadedSrc, setLoadedSrc] = useState(null);
  const [plant, setPlant] = useState();
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [latin, setLatin] = useState("");
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState("Where can you find it 位置 :");
  const [additionalInfoContent, setAdditionalInfoContent] = useState("");
  const [chineseLink, setChineseLink] = useState([]);
  const [link, setLink] = useState("");
  const [editor, setEditor] = useState("Editor:");
  const [picPaths, setPicPaths] = useState([]);
  const [artPathsArray, setArtPathsArray] = useState([]);
  const [numOfPlants, setNumOfPlants] = useState("");
  const [loadingMessage, setLoadingMessage] = useState("");
  const [otherNames, setOtherNames] = useState("");
  const [springPathsArray, setSpringPathsArray] = useState([]);
  const [summerPathsArray, setSummerPathsArray] = useState([]);
  const [autumnPathsArray, setAutumnPathsArray] = useState([]);
  const [winterPathsArray, setWinterPathsArray] = useState([]);
  const [arts, setArts] = useState([]);
  const [artsIndex, setArtsIndex] = useState(0);
  const [displayArtPath, setDisplayArtPath] = useState("");
  const [springPicsArrayIndex, setSpringPicsArrayIndex] = useState(0);
  const [summerPicsArrayIndex, setSummerPicsArrayIndex] = useState(0);
  const [autumnPicsArrayIndex, setAutumnPicsArrayIndex] = useState(0);
  const [winterPicsArrayIndex, setWinterPicsArrayIndex] = useState(0);
  const [artLength, setArtLength] = useState(0);
  const [featureBtnMsg, setFeatureBtnMsg] = useState("Feature");
  const [springLeftover, setSpringLeftover] = useState(0);
  const [summerLeftover, setSummerLeftover] = useState(0);
  const [autumnLeftover, setAutumnLeftover] = useState(0);
  const [winterLeftover, setWinterLeftover] = useState(0);
  const [springCheck, setSpringCheck] = useState(false);
  const [summerCheck, setSummerCheck] = useState(false);
  const [autumnCheck, setAutumnCheck] = useState(false);
  const [winterCheck, setWinterCheck] = useState(false);
  const [zoomPicLink, setZoomPicLink] = useState("");
  const [zoomArtLink, setZoomArtLink] = useState("");
  const [postingtime, setPostingtime] = useState("");
  const [artInfoArray, setArtInfoArray] = useState([]);
  const [springInfo, setSpringInfo] = useState([]);
  const [summerInfo, setSummerInfo] = useState([]);
  const [autumnInfo, setAutumnInfo] = useState([]);
  const [winterInfo, setWinterInfo] = useState([]);
  const [curSeasonInfo, setCurSeasonInfo] = useState({});

  const featureSingleArtHandle = async (input) => {
    setFeatureBtnMsg("Loading...");
    try {
      const newFeature = {
        plant: latin,
        path: zoomArtLink,
      };
      await axios.post(
        `${process.env.REACT_APP_Source_URL}/uploadFeatureArtSingle`,
        newFeature,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      setFeatureBtnMsg("Success");
      setTimeout(() => setFeatureBtnMsg("Submitted!"), 1000);
      setTimeout(() => setFeatureBtnMsg("Feature"), 1000);
    } catch (error) {
      console.log(error);
    }
  };

  const featureSingleHandle = async (input) => {
    setFeatureBtnMsg("Loading...");
    try {
      const newFeature = {
        plant: latin,
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
      setFeatureBtnMsg("Success");
      setTimeout(() => setFeatureBtnMsg("Submitted!"), 1000);
      setTimeout(() => setFeatureBtnMsg("Feature"), 1000);
    } catch (error) {
      console.log(error);
    }
  };

  const handleZoom = (path, seasonInfo) => {
    setZoomArtLink();
    setZoomPicLink(path);
    setCurSeasonInfo(seasonInfo);
    console.log(seasonInfo);
  };

  const handleArtZoom = (path) => {
    setZoomPicLink();
    setZoomArtLink(path);
  };

  useEffect(() => {
    const handleArts = () => {
      var artPaths = [];
      var artInfo = [];

      if (arts.length > 0) {
        arts.forEach((art) => {
          if (art.plant === searchName) {
            artPaths.push(art.path);
            artInfo.push({ painter: art.artist, setting: art.location });
          }
        });
      }

      setArtPathsArray(artPaths);
      setArtLength(artPaths.length);
      setArtInfoArray(artInfo);
    };

    handleArts();
  }, [arts, searchName]);

  const handleGalleryTry = (input) => {
    search.handleGallery(input);
  };

  const nextArt = () => {
    if (artsIndex < artPathsArray.length - 1) {
      setArtsIndex(artsIndex + 1);
    } else if (artsIndex === artPathsArray.length - 1) {
      setArtsIndex(0);
    }
  };

  const handleNavigation = (season, direction) => {
    const seasonState = {
      spring: [
        springPathsArray,
        springPicsArrayIndex,
        setSpringPicsArrayIndex,
        setSpringCheck,
        springLeftover,
      ],
      summer: [
        summerPathsArray,
        summerPicsArrayIndex,
        setSummerPicsArrayIndex,
        setSummerCheck,
        summerLeftover,
      ],
      autumn: [
        autumnPathsArray,
        autumnPicsArrayIndex,
        setAutumnPicsArrayIndex,
        setAutumnCheck,
        autumnLeftover,
      ],
      winter: [
        winterPathsArray,
        winterPicsArrayIndex,
        setWinterPicsArrayIndex,
        setWinterCheck,
        winterLeftover,
      ],
    };

    const [pathsArray, picsArrayIndex, setPicsArrayIndex, setCheck, leftover] =
      seasonState[season];

    const pathLength = pathsArray.path.length;

    if (direction === "previous" && pathLength > 0 && picsArrayIndex >= 4) {
      setCheck(false);
      setPicsArrayIndex(picsArrayIndex - 4);
    } else if (direction === "next") {
      if (pathLength > 0) {
        if (picsArrayIndex + 4 + leftover === pathLength && leftover !== 0) {
          setCheck(true);
          setPicsArrayIndex(picsArrayIndex + 4);
        } else if (picsArrayIndex + 4 < pathLength) {
          setCheck(false);
          setPicsArrayIndex(picsArrayIndex + 4);
        }
      }
    }
  };

  // 现在你可以使用 handleNavigation 进行前后导航
  const handlePrevious = (season) => handleNavigation(season, "previous");
  const handleNext = (season) => handleNavigation(season, "next");

  useEffect(() => {
    const handleArtChange = () => {
      setDisplayArtPath(artPathsArray[artsIndex]);
    };

    handleArtChange();
  }, [artsIndex, artPathsArray]);

  const handleSetup = async () => {
    setLoading(true);
    const startTime = Date.now();

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_Source_URL}/syncPlantInfo`,
        { postName: searchName },
      );

      const endTime = Date.now();
      const loadTime = endTime - startTime;

      if (loadTime < 500) {
        await new Promise((resolve) => setTimeout(resolve, 500 - loadTime));
      }

      setPlant(response.data.resultPost[0]);
      setLatin(response.data.resultPost[0].latinName);
      document.title =
        response.data.resultPost[0].latinName +
        " " +
        response.data.resultPost[0].commonName +
        " " +
        response.data.resultPost[0].chineseName;
      setName(
        response.data.resultPost[0].commonName +
          " " +
          response.data.resultPost[0].chineseName,
      );

      setLocation(response.data.resultPost[0].location || "");
      setAdditionalInfoContent(
        response.data.resultPost[0].additionalInfo.replace(/\r?\n/g, "<br>"),
      );
      setLink(response.data.resultPost[0].link);
      setChineseLink(response.data.resultPost[0].chineseLink || []);
      setEditor(response.data.resultPost[0].editor || "Unknown");
      setPostingtime(response.data.resultPost[0].postingtime.split(" ")[0]);
      setPicPaths(response.data.photographs);
      assignPicPaths(response.data.photographs);
      setArts(response.data.arts);
      setOtherNames(response.data.resultPost[0].otherNames || "");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSetup();
  }, [searchName]);

  useEffect(() => {
    const numOfPlants = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_Source_URL}/numOFPlants`,
        );
        setNumOfPlants(response.data.numOfPlants);
      } catch (error) {
        console.log(error);
      }
    };

    numOfPlants();
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

  const handleGet = async (getName) => {
    setLoadingMessage("Loading...");
    setQuery("");
    setSearchResults("");
    const sendName = getName;
    setSearchName(sendName);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_Source_URL}/syncPlantInfo`,
        { postName: sendName },
      );
      setLatin(response.data.resultPost[0].latinName);
      setName(
        response.data.resultPost[0].commonName +
          " " +
          response.data.resultPost[0].chineseName,
      );
      setLocation(response.data.resultPost[0].location);
      setAdditionalInfoContent(
        response.data.resultPost[0].additionalInfo.replace(/\r?\n/g, "<br>"),
      );
      setLink(response.data.resultPost[0].link);
      setChineseLink(response.data.resultPost[0].chineseLink);
      setEditor(response.data.resultPost[0].editor || "Unknown");
      setPicPaths(response.data.photographs);
      assignPicPaths(response.data.photographs);
      setArts(response.data.arts);
      setOtherNames(response.data.resultPost[0].otherNames || "");
    } catch (error) {
      console.log(error);
    }
    setLoadingMessage("");
  };

  const assignPicPaths = (picPaths) => {
    const paths = {
      spring: { path: [], code: [] },
      summer: { path: [], code: [] },
      autumn: { path: [], code: [] },
      winter: { path: [], code: [] },
    };
    const info = {
      spring: [],
      summer: [],
      autumn: [],
      winter: [],
    };
    picPaths.forEach(({ season, path, code, takenBy, time, location }) => {
      if (!paths[season]) {
        paths[season] = { path: [], code: [] };
      }
      info[season].push({ takenBy, time, location });

      paths[season].path.push(path);
      paths[season].code.push(code ?? "N/A");
    });

    setSummerPathsArray(paths.summer);
    setAutumnPathsArray(paths.autumn);
    setWinterPathsArray(paths.winter);
    setSpringPathsArray(paths.spring);
    setSpringInfo(info.spring);
    setSummerInfo(info.summer);
    setAutumnInfo(info.autumn);
    setWinterInfo(info.winter);
    setSpringLeftover(paths.spring.path.length % 4);
    setSummerLeftover(paths.summer.path.length % 4);
    setAutumnLeftover(paths.autumn.path.length % 4);
    setWinterLeftover(paths.winter.path.length % 4);
  };

  useEffect(() => {
    setLoad(true);
    const img = new Image();
    img.src = displayArtPath;
    img.onload = () => {
      setLoad(false);
      setLoadedSrc(displayArtPath);
    };
  }, [displayArtPath]); // Image Load Function

  function Season({
    seasonPaths = [],
    season,
    seasonCheck,
    seasonIndex,
    seasonLeft,
    seasonInfo,
  }) {
    if (seasonPaths?.path?.length === 0) {
      return null;
    }
    const renderImages = ({ paths, codes }) => {
      return paths.map((path, index) => {
        const code = codes[index] || "N/A"; // 如果code为空，则显示'N/A'
        return (
          <div key={index}>
            <img
              className={styles.databaseImg}
              src={path}
              alt={`${index + 1}`}
              onClick={() => handleZoom(path, seasonInfo[index])}
            />
            {admin && <p style={{ margin: 0 }}>Code: {code}</p>}
          </div>
        );
      });
    };

    const renderEmptySlots = (count) => {
      return Array.from({ length: count }).map((_, index) => (
        <div className={styles.fit} key={index} />
      ));
    };

    if (seasonPaths.length === 0) {
      return null;
    }

    const images = seasonCheck
      ? renderImages({
          paths: seasonPaths.path.slice(seasonIndex, seasonIndex + seasonLeft),
          codes: seasonPaths.code.slice(seasonIndex, seasonIndex + seasonLeft),
        })
      : renderImages({
          paths: seasonPaths.path.slice(seasonIndex, seasonIndex + 4),
          codes: seasonPaths.code.slice(seasonIndex, seasonIndex + 4),
        });

    const emptySlots = seasonCheck ? renderEmptySlots(4 - seasonLeft) : null;

    return (
      <>
        <h1 className={styles.seasonTitle}>
          {season.charAt(0).toUpperCase() + season.slice(1)}
        </h1>
        <div className={styles.seasonContainer}>
          <button
            onClick={() => handlePrevious(season)}
            className={styles.prev1}
          >
            <PreviousIcon width={50} height={50} />
          </button>
          <div className={styles.dbImgs}>
            {images}
            {emptySlots}
          </div>
          <button onClick={() => handleNext(season)} className={styles.next1}>
            <NextIcon width={50} height={50} />
          </button>
        </div>
      </>
    );
  }

  useEffect(() => {
    const seasonState = {
      spring: [springPathsArray, setSpringCheck],
      summer: [summerPathsArray, setSummerCheck],
      autumn: [autumnPathsArray, setAutumnCheck],
      winter: [winterPathsArray, setWinterCheck],
    };

    Object.values(seasonState).forEach(([pathsArray, setSeasonCheck]) => {
      if (!pathsArray || !pathsArray.path) return;
      const length = pathsArray.path.length;
      if (length < 4 && length > 0) {
        setSeasonCheck(true);
      }
    });
  }, [autumnPathsArray, springPathsArray, summerPathsArray, winterPathsArray]); // Include the missing dependencies in the dependency array

  return loading ? (
    <section className={styles.loadingCreation}>
      <div className={styles.dotsContainer}>
        <div className={styles.dots}></div>
        <div className={styles.dots}></div>
        <div className={styles.dots}></div>
        <div className={styles.dots}></div>
        <div className={styles.dots}></div>
      </div>
    </section>
  ) : (
    <>
      <body className={styles.db1}>
        <div className={styles.topbarInfoDB}>
          <div style={{ flexGrow: "1", alignContent: "center" }}>
            <SearchBar
              handleGet={handleGet}
              searchResults={searchResults}
              query={query}
              handleSearch={handleSearch}
              barWidth="80%"
            />
          </div>
          <div className={styles.ttl}>
            <h3 className={styles.db1T}>Name:</h3>
            <h3 className={styles.db1Title}>{latin}</h3>
            <h3 className={styles.db1name}>{name}</h3>
          </div>
        </div>

        <div className={styles.top}>
          <div
            className={`${styles.info} ${artPathsArray.length === 0 ? styles.widen : ""}`}
          >
            {status === "authenticated" && (
              <button
                disabled={status === "loading"}
                onClick={() => {
                  handleEditPage([plant, picPaths, arts, { admin: admin }]);
                  navigate("/editPage");
                }}
                className={styles.editBtn}
              >
                Edit/编辑
              </button>
            )}

            <h3 className={`${styles.titleMessage} ${styles.db1Infos}`}>
              Information Profile 信息档案
            </h3>

            {plant && otherNames && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "0.5rem",
                  alignItems: "center",
                }}
              >
                <h3 className={styles.db1Infos}>Other names:</h3>
                <p className={styles.db1Infos}>{otherNames}</p>
              </div>
            )}

            {plant && location && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "0.5rem",
                  alignItems: "center",
                }}
              >
                <h3 className={styles.db1Infos}>Where can you find it 位置:</h3>
                <p className={styles.db1Infos}>{location}</p>
              </div>
            )}

            {plant && additionalInfoContent && (
              <>
                <h3 className={styles.db1Infos}>Additional Info:</h3>
                <p
                  className={styles.db1Infos}
                  dangerouslySetInnerHTML={{ __html: additionalInfoContent }}
                ></p>
              </>
            )}

            <h3 className={styles.db1Infos}>Encyclopedia 百科介绍</h3>

            {Array.isArray(link) && link.length > 0 && (
              <>
                <h3 className={styles.db1Infos}>(English)</h3>
                {link.map((item, index) => (
                  <div key={index}>
                    <li className={styles.Eng}>
                      {item.linkTitle}: <a href={item.link}>{item.link}</a>
                    </li>
                  </div>
                ))}
              </>
            )}

            {chineseLink.length > 0 &&
              chineseLink.some(
                (item) => item.link !== "" && item.linkTitle !== "",
              ) && (
                <>
                  <h3 className={styles.db1Infos}>(中文)</h3>
                  {chineseLink.map(
                    (item, index) =>
                      item.link !== "" &&
                      item.linkTitle !== "" && (
                        <div key={index}>
                          <li className={styles.CN}>
                            {item.linkTitle}:{" "}
                            <a href={item.link}>{item.link}</a>
                          </li>
                        </div>
                      ),
                  )}
                </>
              )}
          </div>

          {artPathsArray.length > 0 && (
            <div className={styles.arts}>
              <h3 className={styles.artTitle}>Artwork</h3>
              <div className={styles.artPicContainer}>
                {load ? (
                  <div className={styles.artAlt} />
                ) : (
                  <div style={{ position: "relative" }}>
                    <img
                      src={loadedSrc}
                      id="artPic"
                      onClick={() => handleArtZoom(displayArtPath)}
                      alt="art"
                      className={styles.artPic}
                    />
                    <div className={styles.artLabel}>
                      <p>Painter: {artInfoArray[artsIndex].painter}</p>
                      {/* <p>Time: {postingtime}</p> */}
                      <p>Setting: {artInfoArray[artsIndex].setting}</p>
                    </div>
                  </div>
                )}
                <button className={styles.nextArBtn} onClick={nextArt}>
                  <NextIcon
                    className={styles.shiftIcon}
                    width={50}
                    height={50}
                  />
                </button>
              </div>
            </div>
          )}
        </div>
        <div className={styles.hline11} />
        <h3 className={styles.editor}>
          {editor} {postingtime}
        </h3>

        {(springPathsArray?.path?.length !== 0 ||
          summerPathsArray?.path?.length !== 0 ||
          autumnPathsArray?.path?.length !== 0 ||
          winterPathsArray?.path?.length !== 0) && (
          <div className={styles.Bar}>
            <h3 className={styles.btTitle}>Image Gallery 图库</h3>

            {editor && (
              <button
                onClick={() => {
                  handleGalleryTry(searchName);
                }}
                className={styles.expandBtn}
              >
                Expand
              </button>
            )}
          </div>
        )}
        <Season
          seasonPaths={springPathsArray}
          season={"spring"}
          seasonCheck={springCheck}
          seasonIndex={springPicsArrayIndex}
          seasonLeft={springLeftover}
          seasonInfo={springInfo}
        />
        <Season
          seasonPaths={summerPathsArray}
          season={"summer"}
          seasonCheck={summerCheck}
          seasonIndex={summerPicsArrayIndex}
          seasonLeft={summerLeftover}
          seasonInfo={summerInfo}
        />
        <Season
          seasonPaths={autumnPathsArray}
          season={"autumn"}
          seasonCheck={autumnCheck}
          seasonIndex={autumnPicsArrayIndex}
          seasonLeft={autumnLeftover}
          seasonInfo={autumnInfo}
        />
        <Season
          seasonPaths={winterPathsArray}
          season={"winter"}
          seasonCheck={winterCheck}
          seasonIndex={winterPicsArrayIndex}
          seasonLeft={winterLeftover}
          seasonInfo={winterInfo}
        />

        {springPathsArray?.path?.length !== 0 ||
          summerPathsArray?.path?.length !== 0 ||
          autumnPathsArray?.path?.length !== 0 ||
          (winterPathsArray?.path?.length !== 0 && <div className="hline1" />)}
      </body>
      <div className={styles.zoomPicBox}>
        {zoomPicLink && (
          <div className={styles.zoomBox}>
            <img
              className={styles.zoomPic}
              src={zoomPicLink}
              alt={zoomPicLink}
            />
            <button
              className={styles.xButton}
              onClick={() => {
                setZoomPicLink();
              }}
            >
              Back
            </button>
            {status === "authenticated" && zoomPicLink && (
              <div className={styles.featureInfo}>
                <p>Taken by: {curSeasonInfo.takenBy}&nbsp;&nbsp;</p>
                <p>Time: {curSeasonInfo.time}&nbsp;&nbsp;</p>
                <p>Location: {curSeasonInfo.location}&nbsp;&nbsp;</p>
                <button
                  className={styles.featurePicBtn}
                  onClick={() => {
                    featureSingleHandle(zoomPicLink);
                  }}
                >
                  <p>{featureBtnMsg}</p>
                </button>
              </div>
            )}
          </div>
        )}
        {zoomArtLink && (
          <div className={styles.zoomBox}>
            <img
              className={styles.zoomPic}
              src={zoomArtLink}
              alt={zoomArtLink}
            />
            <button
              className={styles.xButton}
              onClick={() => {
                setZoomArtLink();
              }}
            >
              Back
            </button>
            {username && zoomArtLink && (
              <button
                className={styles.featureBtn}
                onClick={() => {
                  featureSingleArtHandle(zoomArtLink);
                }}
              >
                {featureBtnMsg}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default InfoDatabase;
