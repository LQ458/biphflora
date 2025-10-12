import React, { useState, useEffect } from "react";
import "../styles/creation.css";
import CreationDocumentary from "../components/CreationDocumentary.js";
import CreationPaintings from "../components/CreationPaintings.js";
import CreationNotes from "../components/CreationNotes.js";
import CreationView from "../components/CreationView.js";
import CreationVideos from "../components/CreationVideos.js";
import Navbar from "../components/Navbar.js";
import { Outlet } from "react-router-dom";

const Creation = (props) => {
  const [currentSubpage, setCurrentSubpage] = useState("paintings");
  const [viewKey, setViewKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  const titleMapping = {
    paintings: "Creation Paintings 绘画",
    "Notes of Nature": "Creation Notes of Nature 大自然笔记",
    videos: "Creation Documentary 纪录",
  };

  useEffect(() => {
    setCurrentSubpage(props.currentPage);
  }, [props.currentPage]); // The "dependency array"

  useEffect(() => {
    document.title = titleMapping[currentSubpage];
  }, [currentSubpage]);

  const handleDataLoad = (hasEntries) => {
    setHasData(hasEntries);
    setLoading(!hasEntries);
  };

  let currentComponent;
  const handleView = (viewKeyInput) => {
    setViewKey(viewKeyInput);
  };

  if (viewKey) {
    currentComponent = <CreationView vKey={viewKey} handleView={handleView} />;
  } else if (currentSubpage === "documentary") {
    currentComponent = <CreationDocumentary />;
  } else if (currentSubpage === "paintings") {
    currentComponent = (
      <CreationPaintings
        handleView={handleView}
        handleGets={props.handleGets}
        onDataLoad={handleDataLoad}
      />
    );
  } else if (currentSubpage === "notes") {
    currentComponent = <CreationNotes />;
  } else if(currentSubpage === "videos"){
    currentComponent = <CreationVideos />;
  }

  const handleClick = (pick) => {
    setCurrentSubpage(pick);
    document.title = titleMapping[pick];
  };

  return (
    <section className="creationPart1">
      {loading && (
        <section className="loadingCreation">
          <div className="dots-container">
            <div className="dots"></div>
            <div className="dots"></div>
            <div className="dots"></div>
            <div className="dots"></div>
            <div className="dots"></div>
          </div>
        </section>
      )}
      <Navbar />
      <div className="subPageLinks">
        <button
          className={`subPageButton ${currentSubpage === "paintings" && "active"}`}
          onClick={() => {
            handleClick("paintings");
          }}
        >
          Artworks
        </button>
        <button
          className={`subPageButton ${currentSubpage === "videos" && "active"}`}
          onClick={() => {
            handleClick("videos");
          }}
        >
          Videos
        </button>
      </div>



      {/* <Outlet/> */}
      <div className="creationBody">{currentComponent}</div>
    </section>
  );
};

export default Creation;
