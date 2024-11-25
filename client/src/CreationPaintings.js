import axios from "axios";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import levenshtein from "fast-levenshtein";
import SubBox from "./SubBox.js";
import "./creationPaint.css";
import { ReactComponent as PreviousIcon } from "./buttons/caret-back-outline.svg";
import { ReactComponent as SearchIcon } from "./buttons/search-outline.svg";
import { ReactComponent as NextIcon } from "./buttons/caret-forward-outline.svg";
import { useHistory } from "react-router-dom";

const CreationPaintings = (props) => {
  const [pics, setPics] = useState([]);
  const [posts, setPosts] = useState([]);
  const [arts, setArts] = useState([]);
  const [displayObjectList, setDisplayObjectList] = useState([]);
  const [numOfPages, setNumOfPages] = useState(0);
  const [subPgIndex, setSubPgIndex] = useState(1);
  const [currentDisplayIndexes, setCurrentDisplayIndexes] = useState([
    0, 1, 2, 3, 4, 5,
  ]);
  const [currentOrder, setCurrentOrder] = useState(true);
  const [orderIsBold1, setOrderIsBold1] = useState(true);
  const [orderIsBold2, setOrderIsBold2] = useState(false);
  const [topPics, setTopPics] = useState([]);
  const [topArts, setTopArts] = useState([]);
  const [topIndex, setTopIndex] = useState(0);
  const [topBys, setTopBys] = useState([]);
  const [topLoc, setTopLoc] = useState([]);
  const [topTimes, setTopTimes] = useState([]);

  const handleGets = props.handleGets;
  const handleView = props.handleView;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_Source_URL}/creationDocumentary`,
        );
        const allDisplays = response.data.allDisplays;
        setDisplayObjectList(allDisplays);
        console.log(allDisplays);
        for (let i = 0; i < 3; i++) {
          if (allDisplays[i]) {
            setTopPics((prev) => [...prev, allDisplays[i].pic ?? ""]);
            setTopArts((prev) => [...prev, allDisplays[i].art ?? ""]);
            setTopBys((prev) => [...prev, allDisplays[i].artist ?? ""]);
            setTopLoc((prev) => [...prev, allDisplays[i].location ?? ""]);
            setTopTimes((prev) => [...prev, allDisplays[i].artDate ?? ""]);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  const setSubIndex = (index) => {
    setSubPgIndex(index);
    setCurrentDisplayIndexes([
      (index - 1) * 6,
      (index - 1) * 6 + 1,
      (index - 1) * 6 + 2,
      (index - 1) * 6 + 3,
      (index - 1) * 6 + 4,
      (index - 1) * 6 + 5,
    ]);
  };

  function changeOrder(order) {
    if (!order === currentOrder) {
      setOrderIsBold1(order);
      setOrderIsBold2(!order);
      setCurrentOrder(!currentOrder);
      setDisplayObjectList(displayObjectList.reverse());
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

  return (
    <>
      <h1 className="documentarytitle">
        在四季更替中描绘缤纷的生命 To paint the diversity of life in the
        succession of seasons
      </h1>
      {topArts.length > 0 && topPics.length > 0 && (
        <div className="docTop">
          <button className="shift" onClick={() => handleLeft()}>
            <PreviousIcon width={60} height={60} className="icons" />
          </button>
          <img src={topPics[topIndex]} alt="pic" className="topImgs" />
          <div className="artBox">
            <img src={topArts[topIndex]} alt="art" className="topArts" />
            <div className="artDes">
              <div className="artInfos">
                <p className="artInfo">
                  {topBys[topIndex] ? "By " + topBys[topIndex] : "By Unknown"}
                </p>
                <p className="artInfo">
                  {topTimes[topIndex] ? topTimes[topIndex] : "Date: Unknown"}
                </p>
                <p className="artInfo">
                  {topLoc[topIndex]
                    ? "Location: " + topLoc[topIndex]
                    : "Location: Unknown"}
                </p>
              </div>
              <p className="recArt">Recent Artworks</p>
            </div>
          </div>
          <button className="shift" onClick={() => handleRight()}>
            <NextIcon width={60} height={60} className="icons" />
          </button>
        </div>
      )}
      <div className="docBottom">
        <div className="bottomBox">
          <button
            onClick={() => {
              changeOrder(true);
            }}
            className={`btn ${orderIsBold1 && "crFocused"}`}
          >
            Newest
          </button>
          <button
            onClick={() => {
              changeOrder(false);
            }}
            className={`btn ${orderIsBold2 && "crFocused"}`}
          >
            Oldest
          </button>
          {numOfPages > 0 &&
            Array.from({ length: numOfPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => {
                  setSubIndex(index + 1);
                }}
              >
                {index + 1}
              </button>
            ))}
        </div>
        <br />
        {Array.from(
          { length: 3 },
          (_, index) =>
            (displayObjectList[currentDisplayIndexes[2 * index]] ||
              displayObjectList[currentDisplayIndexes[2 * index + 1]]) && (
              <div className="subBox1">
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
