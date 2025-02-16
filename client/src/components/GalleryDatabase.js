import axios from "axios";
import React, { useState, useEffect, useMemo } from "react";
import styles from "../styles/galleryDatabase.module.css";
import SearchPlant from "./SearchPlant.js";
import ArrowIcon from "../src/buttons/arrow.svg";

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
  const [zoomTakenBy, setZoomTakenBy] = useState("");
  const [zoomTime, setZoomTime] = useState("");
  const [zoomLocation, setZoomLocation] = useState("");
  const [featureBtnMsg, setFeatureBtnMsg] = useState("Feature");
  const [month, setMonth] = useState([]);
  const [curMonth, setCurMonth] = useState("");
  const [curMode, setCurMode] = useState("season");
  const [monthPics, setMonthPics] = useState([]);

  useEffect(() => {
    const springBtn = document.getElementById("springBtn");
    if (springBtn) {
      springBtn.focus();
    }
  }, []);

  const sortPicMonth = (pics) => {
    const monthPicMap = new Map();

    pics.forEach((pic) => {
      const timeParts = pic.time.split(" ");
      const monthYear = `${timeParts[1]} ${timeParts[3]}`; // 提取月份和年份
      if (!monthPicMap.has(monthYear)) {
        monthPicMap.set(monthYear, []);
      }
      monthPicMap.get(monthYear).push(pic); // 将图片信息添加到对应的月份
    });

    const sortedMonthArray = Array.from(monthPicMap.keys()).sort((a, b) => {
      const [monthA, yearA] = a.split(" ");
      const [monthB, yearB] = b.split(" ");
      const dateA = new Date(`${monthA} 1, ${yearA}`);
      const dateB = new Date(`${monthB} 1, ${yearB}`);
      return dateA - dateB;
    });

    const monthPicArray = sortedMonthArray.map((month) => ({
      month,
      pics: monthPicMap.get(month),
    }));

    setMonth(sortedMonthArray); // 设置月份数组
    setMonthPics(monthPicArray); // 设置月份图片数组
    console.log(monthPicArray);
  };

  const zoom = (input, takenBy, time, location) => {
    setZoomPicLink(input);
    setZoomTakenBy(takenBy);
    setZoomTime(time);
    setZoomLocation(location);
  };

  const change = (season) => {
    setCurIndex(0);
    const newDisplays = seasons.map(() => false);
    newDisplays[seasons.indexOf(season)] = true;
    setDisplays(newDisplays);
    setCurMode("season");
    setCurMonth("");
  };

  const changeMonth = (month) => {
    setCurIndex(0);
    setCurMonth(month);
    setCurMode("month");
    const newDisplays = seasons.map(() => false);
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
        seasons.forEach((season, index) => {
          newArray[index] = response.data[`${season}Pics`];
        });
        setPics(newArray);
        sortPicMonth(newArray.flat());
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
          {
            headers: {
              Authorization: `${localStorage.getItem("askanything")}`,
            },
          },
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
      <div className={styles.lowerPart}>
        <div className={styles.lowerTop}>
          <button onClick={handleBack} className={styles.backBtn}>
            Back
          </button>
          <h1 className={styles.lowerTitle}>Image Gallery 图库</h1>
        </div>
        <div className={styles.seasons}>
          <button
            id="springBtn"
            className={`${styles.seasonBtn} ${displays[0] ? styles.focussed : ""}`}
            onClick={() => change("spring")}
          >
            Spring
          </button>
          <div className={styles.lineB} />
          <button
            className={`${styles.seasonBtn} ${displays[1] ? styles.focussed : ""}`}
            onClick={() => change("summer")}
          >
            Summer
          </button>
          <div className={styles.lineB} />
          <button
            className={`${styles.seasonBtn} ${displays[2] ? styles.focussed : ""}`}
            onClick={() => change("autumn")}
          >
            Autumn
          </button>
          <div className={styles.lineB} />
          <button
            className={`${styles.seasonBtn} ${displays[3] ? styles.focussed : ""}`}
            onClick={() => change("winter")}
          >
            Winter
          </button>
        </div>
        <br />
        <div className={styles.underSeasons}>
          {month.reduce((acc, m, index) => {
            // 添加当前月份按钮
            acc.push(
              <button
                key={`month-${index}`}
                id={m}
                className={`${styles.monthBtn} ${curMonth === m ? styles.focussed : ""}`}
                onClick={() => changeMonth(m)}
              >
                {m}
              </button>,
            );

            // 如果不是最后一���月份,添加箭头
            if (index < month.length - 1) {
              acc.push(
                <img
                  key={`arrow-${index}`}
                  src={ArrowIcon}
                  alt="arrow"
                  className={styles.arrowIcon}
                />,
              );
            }

            return acc;
          }, [])}
        </div>
        {pics.map(
          (pic, index) =>
            displays[index] &&
            curMode === "season" && (
              <>
                <div className={styles.summerPics} key={index}>
                  {pic
                    .slice(curIndex * 12, (curIndex + 1) * 12)
                    .map((p, index) => (
                      <div className={styles.summerPic} key={index}>
                        <img
                          src={`${process.env.REACT_APP_Source_URL}/public${p.path}`}
                          alt=""
                          className={styles.summerPic}
                          onClick={() =>
                            zoom(p.path, p.takenBy, p.time, p.location)
                          }
                        />
                        <div className={styles.summerPicWords}>
                          <p className={styles.SPW}>
                            {p.takenBy}{" "}
                            {p.time.split(" ")[1] +
                              "/" +
                              p.time.split(" ")[2] +
                              "/" +
                              p.time.split(" ")[3]}{" "}
                            {p.location}
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
        {curMode === "month" &&
          monthPics.map(
            (monthData, index) =>
              monthData.month === curMonth && (
                <>
                  <div className={styles.summerPics} key={index}>
                    {monthData.pics
                      .slice(curIndex * 12, (curIndex + 1) * 12)
                      .map((pic, picIndex) => (
                        <div className={styles.summerPic} key={picIndex}>
                          <img
                            src={`${process.env.REACT_APP_Source_URL}/public${pic.path}`}
                            alt=""
                            className={styles.summerPic}
                            onClick={() =>
                              zoom(
                                pic.path,
                                pic.takenBy,
                                pic.time,
                                pic.location,
                              )
                            }
                          />
                          <div className={styles.summerPicWords}>
                            <p className={styles.SPW}>
                              {pic.takenBy}{" "}
                              {pic.time.split(" ")[1] +
                                "/" +
                                pic.time.split(" ")[2] +
                                "/" +
                                pic.time.split(" ")[3]}{" "}
                              {pic.location}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                  {monthData.pics.length > 12 && (
                    <div className={styles.pageBtns}>
                      {Array.from(
                        { length: Math.ceil(monthData.pics.length / 12) },
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
                src={`${process.env.REACT_APP_Source_URL}/public${zoomPicLink}`}
                alt={zoomPicLink}
              />
              <button
                className={styles.xButton}
                onClick={() => setZoomPicLink("")}
              >
                Back
              </button>
              {username && (
                <div className={styles.featureInfo}>
                  <p>Taken by: {zoomTakenBy}&nbsp;&nbsp;</p>
                  <p>
                    Time:{" "}
                    {zoomTime.split(" ")[1] +
                      "/" +
                      zoomTime.split(" ")[2] +
                      "/" +
                      zoomTime.split(" ")[3]}
                    &nbsp;&nbsp;
                  </p>
                  <p>Location: {zoomLocation}&nbsp;&nbsp;</p>
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
          </div>
        )}
      </div>
    </body>
  );
};

export default GalleryDatabase;
