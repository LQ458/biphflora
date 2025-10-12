import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ReactComponent as PreviousIcon } from "../src/buttons/caret-back-outline.svg";
import { ReactComponent as NextIcon } from "../src/buttons/caret-forward-outline.svg";
import React, { useState, useEffect, useContext } from "react";
import styles from "../styles/birdInfoDatabase.module.css";
import { UserContext } from "../UserContext.js";
import SearchBar from "./SearchBar.js";
import SearchPlant from "./SearchPlant.js";

const InfoDatabase = (search) => {
  const { user } = useContext(UserContext);
  const status = user.get("status");
  const admin = user.get("admin");
  const [searchName, setSearchName] = useState(search.search);
  const handleEditPage = search.handleEditPage;
  const navigate = useNavigate();

  const [resultPost, setResultPost] = useState("");
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

  const [appearance, setAppearance] = useState("aaa");
  const [songs, setSongs] = useState("");
  const [diet, setDiet] = useState("");
  const [habitat, setHabitat] = useState("");
  const [migration, setMigration] = useState("");
  const [breeding, setBreeding] = useState("");
  const [stageChar, setStageChar] = useState([]);
  // const [displayedChar, setDisplayedChar] = useState([]);
  const indexes = {
      Juvenile: 0,
      Subadult: 1,
      MaleAdult: 2,
      FemaleAdult: 3,
  };

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

  // const paths = {
  //     Juvenile: { path: [], code: [] },
  //     Subadult: { path: [], code: [] },
  //     MaleAdult: { path: [], code: [] },
  //     FemaleAdult: { path: [], code: [] },
  //   };

  const handleNavigation = (season, direction) => {
    const seasonState = {
      Juvenile: [
        springPathsArray,
        springPicsArrayIndex,
        setSpringPicsArrayIndex,
        setSpringCheck,
        springLeftover,
      ],
      Subadult: [
        summerPathsArray,
        summerPicsArrayIndex,
        setSummerPicsArrayIndex,
        setSummerCheck,
        summerLeftover,
      ],
      MaleAdult: [
        autumnPathsArray,
        autumnPicsArrayIndex,
        setAutumnPicsArrayIndex,
        setAutumnCheck,
        autumnLeftover,
      ],
      FemaleAdult: [
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

    if (direction === "previous" && pathLength > 0 && picsArrayIndex >= 2) {
      setCheck(false);
      setPicsArrayIndex(picsArrayIndex - 2);
    } else if (direction === "next") {
      if (pathLength > 0) {
        if (picsArrayIndex + 2 + leftover === pathLength && leftover !== 0) {
          setCheck(true);
          setPicsArrayIndex(picsArrayIndex + 2);
        } else if (picsArrayIndex + 2 < pathLength) {
          setCheck(false);
          setPicsArrayIndex(picsArrayIndex + 2);
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
        `${process.env.REACT_APP_Source_URL}/syncBirdInfo`,
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

      setDiet(response.data.resultPost[0].diet);
      setHabitat(response.data.resultPost[0].habitat);
      setSongs(response.data.resultPost[0].songs);
      setMigration(response.data.resultPost[0].migration);
      setAppearance(response.data.resultPost[0].appearance);
      setBreeding(response.data.resultPost[0].breeding);
      // setResultPost(response.data.resultPost[0]);

      setLocation(response.data.resultPost[0].location || "");
      // setAdditionalInfoContent(
      //   response.data.resultPost[0].additionalInfo.replace(/\r?\n/g, "<br>"),
      // );
      setLink(response.data.resultPost[0].link);
      setChineseLink(response.data.resultPost[0].chineseLink || []);
      setEditor(response.data.resultPost[0].editor || "Unknown");
      setPostingtime(response.data.resultPost[0].postingtime.split(" ")[0]);
      setPicPaths(response.data.photographs);
      assignPicPaths(response.data.photographs);
      setArts(response.data.arts);
      setOtherNames(response.data.resultPost[0].otherNames || "");
      setStageChar([response.data.resultPost[0].juvChar,
      response.data.resultPost[0].subChar,
    response.data.resultPost[0].mAdultChar,
  response.data.resultPost[0].fAdultChar])

      

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
          `${process.env.REACT_APP_Source_URL}/numOfBirds`,
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
          `${process.env.REACT_APP_Source_URL}/searchBirdNames`,
        );
        const fetchedNamesArray = response.data.returnNames;
        setNamesArray(fetchedNamesArray);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  //显示top3 match
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

  //显示完整植物信息
  const handleGet = async (getName) => {
    setLoadingMessage("Loading...");
    setQuery("");
    setSearchResults("");
    const sendName = getName;
    setSearchName(sendName);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_Source_URL}/syncBirdInfo`,
        { postName: sendName },
      );
      setLatin(response.data.resultPost[0].latinName);
      setName(
        response.data.resultPost[0].commonName +
          " " +
          response.data.resultPost[0].chineseName,
      );

      setDiet(response.data.resultPost[0].diet);
      setHabitat(response.data.resultPost[0].habitat);
      setSongs(response.data.resultPost[0].songs);
      setMigration(response.data.resultPost[0].migration);
      setAppearance(response.data.resultPost[0].appearance);
      setBreeding(response.data.resultPost[0].breeding);

      setLocation(response.data.resultPost[0].location);
      // setAdditionalInfoContent(
      //   response.data.resultPost[0].additionalInfo.replace(/\r?\n/g, "<br>"),
      // );
      setLink(response.data.resultPost[0].link);
      setChineseLink(response.data.resultPost[0].chineseLink);
      setEditor(response.data.resultPost[0].editor || "Unknown");
      setPicPaths(response.data.photographs);
      assignPicPaths(response.data.photographs);
      setArts(response.data.arts);
      setOtherNames(response.data.resultPost[0].otherNames || "");
      setStageChar([response.data.resultPost[0].juvChar,
      response.data.resultPost[0].subChar,
    response.data.resultPost[0].mAdultChar,
  response.data.resultPost[0].fAdultChar])



      

    } catch (error) {
      console.log(error);
    }
    setLoadingMessage("");
  };

  const assignPicPaths = (picPaths) => {
    const paths = {
      Juvenile: { path: [], code: [] },
      Subadult: { path: [], code: [] },
      MaleAdult: { path: [], code: [] },
      FemaleAdult: { path: [], code: [] },
    };
    const info = {
      Juvenile: [],
      Subadult: [],
      MaleAdult: [],
      FemaleAdult: [],
    };

    
    picPaths.forEach(({ season, path, code, takenBy, time, location }) => {
      if (!paths[season]) {
        paths[season] = { path: [], code: [] };
      }
      info[season].push({ takenBy, time, location });

      paths[season].path.push(path);
      paths[season].code.push(code ?? "N/A");

      // displayIndexes.push(index[season]);
    });

    // var charList = []

    // setDisplayedChar(displayIndexes.forEach((i)=> {charList.push(stageChar[i])}));


    /* spring: juv summer: subadult autumn: maleadult winter:femaleadult */
    setSpringPathsArray(paths.Juvenile);
    setSummerPathsArray(paths.Subadult);
    setAutumnPathsArray(paths.MaleAdult);
    setWinterPathsArray(paths.FemaleAdult);
    
    setSpringInfo(info.Juvenile);
    setSummerInfo(info.Subadult);
    setAutumnInfo(info.MaleAdult);
    setWinterInfo(info.FemaleAdult);

    setSpringLeftover(paths.Juvenile.path.length % 2);
    setSummerLeftover(paths.Subadult.path.length % 2);
    setAutumnLeftover(paths.MaleAdult.path.length % 2);
    setWinterLeftover(paths.FemaleAdult.path.length % 2);
  };

  useEffect(() => {
    setLoad(true);
    const img = new Image();
    img.src = `${process.env.REACT_APP_Source_URL}/public${displayArtPath}`;
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
    index,
    text
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
              src={`${process.env.REACT_APP_Source_URL}/public${path}`}
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
          paths: seasonPaths.path.slice(seasonIndex, seasonIndex + 2),
          codes: seasonPaths.code.slice(seasonIndex, seasonIndex + 2),
        });

    const emptySlots = seasonCheck ? renderEmptySlots(2 - seasonLeft) : null;

    return (
      <>
        <h1 className={styles.seasonTitle}>
          {text.charAt(0).toUpperCase() + season.slice(1)}
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

          <div className = {styles.birdChar}>
            {/* Characteristics: */}
            <p className={styles.charTitle}>
              Characteristics:
            </p>
            <br/>
            <p className={styles.charContent}>
              {stageChar[index]}
              {/* placehodler */}
            </p>
          </div>
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
      if (length < 2 && length > 0) {
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
              placeHolder="Enter the name of the bird 输入鸟类名..."
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
                  navigate("/birdEditPage");
                }}
                className={styles.editBtn}
              >
                Edit/编辑
              </button>
            )}

            <h3 className={`${styles.titleMessage} ${styles.db1Infos}`}>
              Information Profile 信息档案
            </h3>

            {plant && appearance && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "0.5rem",
                  alignItems: "center",
                }}
              >
                <h3 className={styles.db1Infos}>Description 外型特征:</h3>
                <p className={styles.db1Infos}>{appearance}</p>
              </div>
            )}

            {plant && songs && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "0.5rem",
                  alignItems: "center",
                }}
              >
                <h3 className={styles.db1Infos}>Songs and Calls 鸣叫特征:</h3>
                <p className={styles.db1Infos}>{songs}</p>
              </div>
            )}

            {plant && appearance && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "0.5rem",
                  alignItems: "center",
                }}
              >
                <h3 className={styles.db1Infos}>Diet and Foraging 主要食谱与觅食行为:</h3>
                <p className={styles.db1Infos}>{diet}</p>
              </div>
            )}

            {plant && habitat && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "0.5rem",
                  alignItems: "center",
                }}
              >
                <h3 className={styles.db1Infos}>Habitat 栖息地:</h3>
                <p className={styles.db1Infos}>{habitat}</p>
              </div>
            )}

            {plant && migration && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "0.5rem",
                  alignItems: "center",
                }}
              >
                <h3 className={styles.db1Infos}>Movements and Migration 迁徙行为:</h3>
                <p className={styles.db1Infos}>{migration}</p>
              </div>
            )}

            {plant && breeding && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "0.5rem",
                  alignItems: "center",
                }}
              >
                <h3 className={styles.db1Infos}>Breeding 繁育:</h3>
                <p className={styles.db1Infos}>{breeding}</p>
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

            <h3 className={styles.db1Infos}>Reference 参考文献:</h3>

            {Array.isArray(link) && link.length > 0 && (
              <>
                <h3 className={styles.db1Infos}>(English)</h3>
                {link.map((item, index) => {
                  if (!item || !item.linkTitle || !item.link) return null;

                  return (
                    <div key={index}>
                      <li className={styles.Eng}>
                        {item.linkTitle}:{" "}
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {item.link}
                        </a>
                      </li>
                    </div>
                  );
                })}
              </>
            )}

            {Array.isArray(chineseLink) && chineseLink.length > 0 && (
              <>
                <h3 className={styles.db1Infos}>(中文)</h3>
                {chineseLink.map((item, index) => {
                  if (!item || !item.linkTitle || !item.link) return null;

                  return (
                    <div key={index}>
                      <li className={styles.CN}>
                        {item.linkTitle}:{" "}
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {item.link}
                        </a>
                      </li>
                    </div>
                  );
                })}
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
                      src={`${process.env.REACT_APP_Source_URL}/public${loadedSrc}`}
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
                {artPathsArray.length>1?
                <button className={styles.nextArBtn} onClick={nextArt}>
                  <NextIcon
                    className={styles.shiftIcon}
                    width={50}
                    height={50}
                  />
                </button>:<></>}
              </div>
            </div>
          )}
        </div>
        <div className={styles.hline11} />
        <h3 className={styles.editor}>
          Editor: {editor} {postingtime}
        </h3>
        {(springPathsArray?.path?.length !== 0 ||
          summerPathsArray?.path?.length !== 0 ||
          autumnPathsArray?.path?.length !== 0 ||
          winterPathsArray?.path?.length !== 0) && (
          <div className={styles.Bar}>
            <h3 className={styles.btTitle}>Image Gallery 图库</h3>

            {/* {editor && (
              <button
                onClick={() => {
                  handleGalleryTry(searchName);
                }}
                className={styles.expandBtn}
              >
                Expand
              </button>
            )} */}
          </div>
        )}
        <Season
          seasonPaths={springPathsArray}
          text={"Juvenile"}
          season={"Juvenile"}
          index={0}
          seasonCheck={springCheck}
          seasonIndex={springPicsArrayIndex}

          seasonLeft={springLeftover}
          seasonInfo={springInfo}
        />
        <Season
          seasonPaths={summerPathsArray}
          text={"Sub-Adult"}
          season={"Subadult"}
          index={1}
          seasonCheck={summerCheck}
          seasonIndex={summerPicsArrayIndex}
          seasonLeft={summerLeftover}
          seasonInfo={summerInfo}
        />
        <Season
          seasonPaths={autumnPathsArray}
          text={"Male Adult"}
          season={"MaleAdult"}
          index={2}
          seasonCheck={autumnCheck}
          seasonIndex={autumnPicsArrayIndex}
          seasonLeft={autumnLeftover}
          seasonInfo={autumnInfo}
        />
        <Season
          seasonPaths={winterPathsArray}
          test={"Female Adult"}
          season={"FemaleAdult"}
          index={3}
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
              src={`${process.env.REACT_APP_Source_URL}/public${zoomPicLink}`}
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
              src={`${process.env.REACT_APP_Source_URL}/public${zoomArtLink}`}
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
