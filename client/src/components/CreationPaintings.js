import axios from "axios";
import React, { useState, useEffect } from "react";
import SubBox from "./SubBox.js";
import "../styles/creationPaint.css";
import { ReactComponent as PreviousIcon } from "../src/buttons/caret-back-outline.svg";
import { ReactComponent as NextIcon } from "../src/buttons/caret-forward-outline.svg";
import styles from "../styles/galleryDatabase.module.css";

const CreationPaintings = ({ handleGets, handleView, onDataLoad }) => {
  const [pics, setPics] = useState([]);
  const [posts, setPosts] = useState([]);
  const [arts, setArts] = useState([]);
  const [displayObjectList, setDisplayObjectList] = useState([]);
  // const [numOfPages, setNumOfPages] = useState(0);
  const [subPgIndex, setSubPgIndex] = useState(1);
  const [currentDisplayIndexes, setCurrentDisplayIndexes] = useState([
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
  ]);
  const [currentOrder, setCurrentOrder] = useState(false);
  const [orderIsBold1, setOrderIsBold1] = useState(false);
  const [orderIsBold2, setOrderIsBold2] = useState(true);
  const [topPics, setTopPics] = useState([]);
  const [topArts, setTopArts] = useState([]);
  const [topIndex, setTopIndex] = useState(0);
  const [topBys, setTopBys] = useState([]);
  const [topLoc, setTopLoc] = useState([]);
  const [topTimes, setTopTimes] = useState([]);
  const itemsPerPage = 4;

  function parseArtDate(dateString) {
    // 1. Split on any non-digit character
    const parts = dateString.split(/\D/); // e.g., "10/25/23" -> ['10', '25', '23']

    if (parts.length !== 3) {
      // Handle potential bad data by returning the earliest possible date
      return new Date(0); 
    }

    // 2. Parse parts into numbers
    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    // 3. Create the Date object
    // We add 2000 to the year to handle the 'yy' format (e.g., 23 -> 2023)
    // We subtract 1 from the month because Date() is 0-indexed (Jan=0, Dec=11)
    return new Date(2000 + year, month - 1, day);
  }

  useEffect(() => {

    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_Source_URL}/creationDocumentary`,
        );
        const allDisplays = response.data.allDisplays;
        allDisplays.sort((a, b) => {
          // Get the Date objects for comparison
          const dateA = parseArtDate(a.artDate);
          const dateB = parseArtDate(b.artDate);

          // Sort descending (latest to earliest)
          // This works by subtracting the timestamps.
          return dateA - dateB;
        });
        setDisplayObjectList(allDisplays);
        setCurrentDisplayIndexes(Array.from(Array(allDisplays.length).keys()))
        if (allDisplays && allDisplays.length > 0) {
          const topThreeDisplays = allDisplays.slice(allDisplays.length-3, allDisplays.length);
          const newTopPics = [];
          const newTopArts = [];
          const newTopBys = [];
          const newTopLoc = [];
          const newTopTimes = [];

          topThreeDisplays.forEach((display) => {
            newTopPics.push(display.pic || "");
            newTopArts.push(display.art || "");
            newTopBys.push(display.artist || "");
            newTopLoc.push(display.location || "");
            newTopTimes.push(display.artDate || "");
          });

          setTopPics(newTopPics);
          setTopArts(newTopArts);
          setTopBys(newTopBys);
          setTopLoc(newTopLoc);
          setTopTimes(newTopTimes);


          // Notify parent that we have data
          onDataLoad(true);
        } else {
          // Notify parent that we don't have data
          onDataLoad(false);
        }
      } catch (error) {
        console.error("Error fetching creation data:", error);
        onDataLoad(false);
      }
    };

    fetchData();
  }, [onDataLoad]);

  const numOfPages = Math.ceil(displayObjectList.length / itemsPerPage);
  const startIndex = (subPgIndex - 1) * itemsPerPage;
  const currentItems = displayObjectList.slice(startIndex, startIndex + itemsPerPage);


  const setSubIndex = (currentIndex) => {
    setSubPgIndex(currentIndex);
    // setCurrentDisplayIndexes([
    //   (index - 1) * 6,
    //   (index - 1) * 6 + 1,
    //   (index - 1) * 6 + 2,
    //   (index - 1) * 6 + 3,
    //   (index - 1) * 6 + 4,
    //   (index - 1) * 6 + 5,
    // ]);
    setCurrentDisplayIndexes(Array.from({length:itemsPerPage}, (_, index)=> (currentIndex - 1) * itemsPerPage + index));
  };

  function changeOrder(order) {
    if (!order === currentOrder) {
      setOrderIsBold1(order);
      setOrderIsBold2(!order);
      setCurrentOrder(!currentOrder);
      setDisplayObjectList(displayObjectList.reverse());
      if (displayObjectList){
        setSubIndex(1);
      }
    }
  }

  function sortObjectsByDate(objects, ascending = true) {
    const sortedObjects = [...objects];

    sortedObjects.sort((a, b) => {
      const dateA = new Date(a.postingtime);
      const dateB = new Date(b.postingtime);

      if (ascending) {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });

    return sortedObjects;
  }

  const handleLeft = () => {
    if (topIndex > 0) {
      setTopIndex(topIndex - 1);
    }
  };

  const handleRight = () => {
    if (topIndex < topPics.length - 1) {
      setTopIndex(topIndex + 1);
    }
  };

  if (!displayObjectList || displayObjectList.length === 0) {
    return null;
  }

  return (
    <>
      <h1 className="documentarytitle">
        在四季更替中描绘缤纷的生命 To paint the diversity of life in the
        succession of seasons
      </h1>
      {topArts.length > 0 && topPics.length > 0 && (
        <div className="docTop">
          <button className="shift" onClick={handleLeft}>
            <PreviousIcon width={60} height={60} className="icons" />
          </button>
          <img
            src={`${process.env.REACT_APP_Source_URL}/public${topPics[topIndex]}`}
            alt="pic"
            className="topImgs"
          />
          <div className="artBox">
            <img
              src={`${process.env.REACT_APP_Source_URL}/public${topArts[topIndex]}`}
              alt="art"
              className="topArts"
            />
            <div className="artDes">
              <div className="artInfos">
                <p className="artInfo">
                  {topBys[topIndex] ? "By " + topBys[topIndex] : "By Unknown"}
                </p>
                <p className="artInfo">
                  {topLoc[topIndex]
                    ? "Location: " + topLoc[topIndex]
                    : "Location: Unknown"}
                </p>
              </div>
            </div>
          </div>
          <button className="shift" onClick={handleRight}>
            <NextIcon width={60} height={60} className="icons" />
          </button>
        </div>
      )}

      <div className="docBottom">
        <div className="bottomBox">
          <button
            onClick={() => changeOrder(true)}
            className={`btn ${orderIsBold1 && "crFocused"}`}
          >
            Newest
          </button>
          <button
            onClick={() => changeOrder(false)}
            className={`btn ${orderIsBold2 && "crFocused"}`}
          >
            Oldest
          </button>

          <br/>
          <br/>
          {numOfPages > 0 &&
            Array.from({ length: numOfPages }, (_, index) => (
              <button 
                className={`${styles.seasonBtn} ${index+1 === subPgIndex ? styles.focussed : ""}`}
                key={index + 1} 
                // className="creationChangePageButton" 
                onClick={() => setSubIndex(index + 1)}>
                {index + 1}
              </button>
            ))}
        </div>
        <br />
        {Array.from(
          { length:  itemsPerPage / 2},
          (_, index) =>
            (displayObjectList[currentDisplayIndexes[2 * index]] ||
              displayObjectList[currentDisplayIndexes[2 * index + 1]]) && (
              <div key={index} className="subBox1">
                <SubBox
                  displayObjectList={displayObjectList}
                  currentDisplayIndexes={currentDisplayIndexes}
                  index={2 * index}
                  handleGets={handleGets}
                />
              </div>
            ),
        )}
        <br />
      </div>
    </>
  );
};

export default CreationPaintings;
