import axios from "../api/http";
import urls, { mediaUrl, responsiveMediaProps } from "../tools/url";
import React, { useState, useEffect, useMemo } from "react";
import styles from "../styles/galleryDatabase.module.css";
import MediaImage from "./MediaImage.js";

const GalleryDatabase = (props) => {
  const seasons = useMemo(() => ["spring", "summer", "autumn", "winter"], []);
  const month2NumMap = {
    Jan: "01/",
    Feb: "02/",
    Mar: "03/",
    Apr: "04/",
    May: "05/",
    Jun: "06/",
    Jul: "07/",
    Aug: "08/",
    Sep: "09/",
    Oct: "10/",
    Nov: "11/",
    Dec: "12/",
  };
  const [curIndex, setCurIndex] = useState(0);
  const [username, setUsername] = useState("");
  const [zoomPicLink, setZoomPicLink] = useState("");
  const [zoomTakenBy, setZoomTakenBy] = useState("");
  const [zoomTime, setZoomTime] = useState("");
  const [zoomLocation, setZoomLocation] = useState("");
  const [featureBtnMsg] = useState("Feature");
  const [seasonMonthMap, setSeasonMonthMap] = useState({});

  // Which season is selected (e.g. "spring", or "" if none yet)
  const [selectedSeason, setSelectedSeason] = useState("");
  // Which month‐year is selected within that season (e.g. "Mar 2025")
  const [selectedMonth, setSelectedMonth] = useState("");

  useEffect(() => {
    const springBtn = document.getElementById("springBtn");
    if (springBtn) {
      springBtn.focus();
    }
  }, []);

  const zoom = (input, takenBy, time, location) => {
    setZoomPicLink(input);
    setZoomTakenBy(takenBy);
    setZoomTime(time);
    setZoomLocation(location);
  };

  useEffect(() => {
    const plant = props.customKey;
    const getPics = async () => {
      try {
        const response = await axios.post(urls.getPics, { plant: plant });
        let newArray = [];
        let availableSeason = "";
        seasons.forEach((season, index) => {
          newArray[index] = response.data[`${season}Pics`];
          if (
            response.data[`${season}Pics`].length > 0 &&
            availableSeason === ""
          ) {
            availableSeason = season;
          }
        });

        const seasonMonthMap = seasons.reduce((acc, season, i) => {
          const pics = newArray[i];
          const monthMap = {};
          pics.forEach((pic) => {
            // assume pic.time === "Day Mon DD YYYY …"
            const [, mon, , year] = pic.time.split(" ");
            const key = `${mon} ${year}`;
            if (!monthMap[key]) monthMap[key] = [];
            monthMap[key].push(pic);
          });
          acc[season] = monthMap;
          return acc;
        }, {});

        setSelectedSeason(availableSeason);
        setSelectedMonth(Object.keys(seasonMonthMap[availableSeason])[0] || "");

        setSeasonMonthMap(seasonMonthMap);
      } catch (error) {
        console.log(error);
      }
    };
    getPics();
  }, [props.customKey, seasons]);

  const handleBack = () => {
    props.handleBack(props.customKey);
  };

  const featureSingleHandle = async (input) => {
    try {
      const newFeature = {
        plant: " " + props.customKey,
        path: zoomPicLink,
      };
      await axios.post(urls.uploadFeatureSingle, newFeature, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get(urls.userInfo, {
          headers: {
            Authorization: `${localStorage.getItem("askanything")}`,
          },
        });
        setUsername(response.data.username);
      } catch (error) {
        console.log(error);
      }
    };
    // setSelectedSeason(availableSeason);
    fetchUserInfo();
  }, []);

  // setSelectedMonth((Object.keys([s])[0] || ""));

  return (
    <div className={styles.db}>
      <div className={styles.lowerPart}>
        <div className={styles.lowerTop}>
          <h1 className={styles.lowerTitle}>Image Gallery 图库</h1>
          <button onClick={handleBack} className={styles.backBtn}>
            Back
          </button>
        </div>

        {/* <div className={styles.seasons}>
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
        </div> */}
        <div className={styles.seasons}>
          {seasons.map((s) => (
            <>
              <button
                key={s}
                className={`${styles.seasonBtn} ${s === selectedSeason ? styles.focussed : ""}`}
                onClick={() => {
                  setSelectedSeason(s);
                  setSelectedMonth(Object.keys(seasonMonthMap[s])[0] || "");
                  setCurIndex(0);
                }}
              >
                {s[0].toUpperCase() + s.slice(1)}
              </button>
              {s !== "winter" && <div className={styles.lineB} />}
            </>
          ))}
        </div>

        <br />

        {selectedSeason && (
          <div className="Month selector">
            {Object.keys(seasonMonthMap[selectedSeason] || {})
              .sort((a, b) => new Date(a) - new Date(b))
              .map((m, index) => (
                <>
                  <button
                    key={m}
                    className={`${styles.seasonBtn} ${m === selectedMonth ? styles.focussed : ""}`}
                    onClick={() => {
                      setSelectedMonth(m);
                      setCurIndex(0);
                    }}
                  >
                    {month2NumMap[m.slice(0, 3)] + m.slice(4, 8)}
                  </button>
                </>
              ))}
          </div>
        )}

        <br />

        {/* <div className={styles.underSeasons}>
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
        </div> */}

        {/* {pics.map(
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
                          src={mediaUrl(p.path)}
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
        )} */}
        {selectedSeason &&
          selectedMonth &&
          (() => {
            const picsToShow =
              seasonMonthMap[selectedSeason][selectedMonth] || [];
            const pageSize = 12;
            const start = curIndex * pageSize;
            return (
              //
              <>
                <div className={styles.summerPics}>
                  {picsToShow
                    .slice(start, start + pageSize)
                    .map((p, index) => (
                      <div className={styles.summerPic} key={index}>
                        <MediaImage
                          {...responsiveMediaProps(p.path, {
                            sizes: "(max-width: 700px) 92vw, 24vw",
                          })}
                          loading="lazy"
                          decoding="async"
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
                {picsToShow.length > 12 && (
                  <div className={styles.pageBtns}>
                    {Array.from(
                      { length: Math.ceil(picsToShow.length / 12) },
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
            );
          })()}

        {/* {curMode === "month" &&
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
                            src={mediaUrl(pic.path)}
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
          )} */}
      </div>
      <div className={styles.btmLine} />
      <div className={styles.zoomPicBox}>
        {zoomPicLink && (
          <div className={styles.zoomBackground}>
            <div className={styles.zoomBox}>
              <MediaImage
                className={styles.zoomPic}
                src={mediaUrl(zoomPicLink)}
                loading="lazy"
                decoding="async"
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
    </div>
  );
};

export default GalleryDatabase;
