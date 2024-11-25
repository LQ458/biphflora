import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ReactComponent as PreviousIcon } from "./buttons/caret-back-outline.svg";
import { ReactComponent as NextIcon } from "./buttons/caret-forward-outline.svg";
import React, { useState, useEffect } from "react";
import "./infoDatabase.css";
import { useContext } from "react";
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
  const [titleMessage, setTitleMessage] = useState(
    "Information Profile 信息档案",
  );
  const [location, setLocation] = useState("Where can you find it 位置 :");
  const [additionalInfo, setAdditionalInfo] = useState("Additional Info:");
  const [additionalInfoContent, setAdditionalInfoContent] = useState("");
  const [encyclopediaMessage, setEncyclopediaMessage] =
    useState("Encyclopedia 百科介绍");
  const [chineseLink, setChineseLink] = useState([]);
  const [link, setLink] = useState("");
  const [editor, setEditor] = useState("Editor:");
  const [picPaths, setPicPaths] = useState([]);
  const [pathsArray, setPathsArray] = useState([]);
  const [artPathsArray, setArtPathsArray] = useState([]);
  const [numOfPlants, setNumOfPlants] = useState("");
  const [loadingMessage, setLoadingMessage] = useState("");
  const [chineseSitesMessage, setChineseSitesMessage] = useState("中文");
  const [englishSitesMessage, setEnglishSitesMessage] = useState("English");
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
  const [artIndex, setArtIndex] = useState(1);
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

  const featureSingleArtHandle = async (input) => {
    setFeatureBtnMsg("Loading...");
    try {
      const newFeature = {
        plant: latin,
        path: zoomArtLink,
      };
      const response = await axios.post(
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
      const response = await axios.post(
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

  const handleZoom = (path) => {
    setZoomArtLink();
    setZoomPicLink(path);
  };

  const handleArtZoom = (path) => {
    setZoomPicLink();
    setZoomArtLink(path);
  };

  useEffect(() => {
    const handleArts = () => {
      var artPaths = [];

      if (arts.length > 0) {
        arts.forEach((art) => {
          if (art.plant === searchName) artPaths.push(art.path);
        });
      }

      setArtPathsArray(artPaths);
      setArtLength(artPaths.length);
    };

    handleArts();
  }, [arts, searchName]);

  const handleGalleryTry = (input) => {
    search.handleGallery(input);
  };

  const prevArt = () => {
    if (artsIndex > 0) {
      setArtsIndex(artsIndex - 1);
      setArtIndex(artIndex - 1);
    }
  };

  const nextArt = () => {
    if (artsIndex < artPathsArray.length - 1) {
      setArtsIndex(artsIndex + 1);
      setArtIndex(artIndex + 1);
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

  // Now you can use handleNavigation for both previous and next navigation
  const handlePrevious = (season) => handleNavigation(season, "previous");
  const handleNext = (season) => handleNavigation(season, "next");

  useEffect(() => {
    const handleArtChange = () => {
      setDisplayArtPath(artPathsArray[artsIndex]);
    };

    handleArtChange();
  }, [artsIndex, artPathsArray]);

  useEffect(() => {
    const handleSetup = async () => {
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_Source_URL}/getStuff`,
          { postName: searchName },
        );
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
        setPostingtime(response.data.resultPost[0].postingtime);
        setPicPaths(response.data.photographs);
        assignPicPaths(response.data.photographs);
        setArts(response.data.arts);
        setOtherNames(response.data.resultPost[0].otherNames || "");
      } catch (error) {
        console.log(error);
      }
    };

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
    setPathsArray([]);
    setQuery("");
    setSearchResults("");
    const sendName = getName;
    setSearchName(sendName);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_Source_URL}/getStuff`,
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
    picPaths.forEach(({ season, path, code }) => {
      if (!paths[season]) {
        paths[season] = { path: [], code: [] };
      }

      paths[season].path.push(path);
      paths[season].code.push(code ?? "N/A");
    });

    setSummerPathsArray(paths.summer);
    setAutumnPathsArray(paths.autumn);
    setWinterPathsArray(paths.winter);
    setSpringPathsArray(paths.spring);
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
  }, [displayArtPath]); // Image Load Funtion

  function Season({
    seasonPaths = [],
    season,
    seasonCheck,
    seasonLeft,
    seasonIndex,
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
              className="databaseImg"
              src={path}
              alt={`${index + 1}`}
              onClick={() => handleZoom(path, codes[index])}
            />
            {admin && <p style={{ margin: 0 }}>Code: {code}</p>}
          </div>
        );
      });
    };

    const renderEmptySlots = (count) => {
      return Array.from({ length: count }).map((_, index) => (
        <div className="fit" key={index} />
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
        <h1 className="seasonTitle">
          {season.charAt(0).toUpperCase() + season.slice(1)}
        </h1>
        <div className="seasonContainer">
          <button onClick={() => handlePrevious(season)} className="prev1">
            <PreviousIcon width={50} height={50} />
          </button>
          <div className="dbImgs">
            {images}
            {emptySlots}
          </div>
          <button onClick={() => handleNext(season)} className="next1">
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

  const itemTemplate = (item) => {
    return (
      <img
        src={item}
        alt="artwork"
        style={{ width: "100%", display: "block" }}
      />
    );
  };
  return (
    <>
      <body className="db1">
        <div className="topbarInfoDB">
          <div style={{ flexGrow: "1", alignContent: "center" }}>
            <SearchBar
              handleGet={handleGet}
              searchResults={searchResults}
              query={query}
              handleSearch={handleSearch}
              barWidth="80%"
            />
          </div>
          <div className="ttl">
            <h3 className="db1T">Name:</h3>
            <h3 className="db1Title">{latin}</h3>
            <h3 className="db1name">{name}</h3>
          </div>
        </div>

        {/* Search portion (includes the name of the plant) */}

        <div className="top">
          <div className="info">
            {status === "authenticated" && (
              <button
                disabled={status === "loading"}
                onClick={() => {
                  handleEditPage([plant, picPaths, arts, { admin: admin }]);
                  navigate("/editPage");
                }}
                className="editBtn"
              >
                Edit/编辑
              </button>
            )}

            <h3 className="titleMessage db1Infos">
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
                <h3 className="db1Infos">Other names:</h3>
                <p className="db1Infos">{otherNames}</p>
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
                <h3 className="db1Infos">Where can you find it 位置:</h3>
                <p className="db1Infos">{location}</p>
              </div>
            )}

            {plant && additionalInfoContent && (
              <>
                <h3 className="db1Infos">Additional Info:</h3>
                <p
                  className="db1Infos"
                  dangerouslySetInnerHTML={{ __html: additionalInfoContent }}
                ></p>
              </>
            )}

            <h3 className="db1Infos">Encyclopedia 百科介绍</h3>

            {Array.isArray(link) && link.length > 0 && (
              <>
                <h3 className="db1Infos">(English)</h3>
                {link.map((item, index) => (
                  <div key={index}>
                    <li className="Eng">
                      {item.linkTitle}: {item.link}
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
                  <h3 className="db1Infos">(中文)</h3>
                  {chineseLink.map(
                    (item, index) =>
                      item.link !== "" &&
                      item.linkTitle !== "" && (
                        <div key={index}>
                          <li className="CN">
                            {item.linkTitle}: {item.link}
                          </li>
                        </div>
                      ),
                  )}
                </>
              )}
          </div>

          {/* Information portion (includes the information of the plant) */}

          <div className="arts">
            <h3 className="artTitle">Artwork</h3>
            <div className="artPicContainer">
              <button className="prevArtBtn" onClick={prevArt}>
                <PreviousIcon className="shiftIcon" width={50} height={50} />
              </button>
              {load ? (
                <div className="artAlt" />
              ) : (
                <img
                  src={loadedSrc}
                  id="artPic"
                  onClick={() => handleArtZoom(displayArtPath)}
                  alt="art"
                  className="artPic"
                />
              )}
              <button className="nextArBtn" onClick={nextArt}>
                <NextIcon className="shiftIcon" width={50} height={50} />
              </button>
            </div>
          </div>

          {/* Art portion (includes the art of the plant) */}
        </div>
        <div className="hline11" />
        <h3 className="editor">
          {editor} {postingtime}
        </h3>

        {/* Top portion (includes artwork) */}

        {(springPathsArray?.path?.length !== 0 ||
          summerPathsArray?.path?.length !== 0 ||
          autumnPathsArray?.path?.length !== 0 ||
          winterPathsArray?.path?.length !== 0) && (
          <div className="Bar">
            <h3 className="btTitle">Image Gallery图库</h3>

            {editor && (
              <button
                onClick={() => {
                  handleGalleryTry(searchName);
                }}
                className="expandBtn"
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
        />
        <Season
          seasonPaths={summerPathsArray}
          season={"summer"}
          seasonCheck={summerCheck}
          seasonIndex={summerPicsArrayIndex}
          seasonLeft={summerLeftover}
        />
        <Season
          seasonPaths={autumnPathsArray}
          season={"autumn"}
          seasonCheck={autumnCheck}
          seasonIndex={autumnPicsArrayIndex}
          seasonLeft={autumnLeftover}
        />
        <Season
          seasonPaths={winterPathsArray}
          season={"winter"}
          seasonCheck={winterCheck}
          seasonIndex={winterPicsArrayIndex}
          seasonLeft={winterLeftover}
        />

        {springPathsArray?.path?.length !== 0 ||
          summerPathsArray?.path?.length !== 0 ||
          autumnPathsArray?.path?.length !== 0 ||
          (winterPathsArray?.path?.length !== 0 && <div className="hline1" />)}
      </body>
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
            {status === "authenticated" && zoomPicLink && (
              <button
                className="featurePicBtn"
                onClick={() => {
                  featureSingleHandle(zoomPicLink);
                }}
              >
                {featureBtnMsg}
              </button>
            )}
          </div>
        )}
        {zoomArtLink && (
          <div className="zoomBox">
            <img className="zoomPic" src={zoomArtLink} alt={zoomArtLink} />
            <button
              className="xButton"
              onClick={() => {
                setZoomArtLink();
              }}
            >
              X
            </button>
            {username && zoomArtLink && (
              <button
                className="featureBtn"
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
