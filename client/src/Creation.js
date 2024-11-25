import axios from "axios";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./creation.css";
import { ReactComponent as SearchIcon } from "./buttons/search-outline.svg";
import { useHistory } from "react-router-dom";
import CreationDocumentary from "./CreationDocumentary.js";
import CreationPaintings from "./CreationPaintings.js";
import CreationNotes from "./CreationNotes.js";
import CreationView from "./CreationView.js";
import Navbar from "./Navbar.js";

const Creation = (props) => {
  const [currentSubpage, setCurrentSubpage] = useState("paintings");
  const [viewKey, setViewKey] = useState("");
  const [load, setLoad] = useState(true);

  const titleMapping = {
    paintings: "Creation Paintings 绘画",
    "Notes of Nature": "Creation Notes of Nature 大自然笔记",
    documentary: "Creation Documentary 纪录",
  };

  useEffect(() => {
    document.title = titleMapping["paintings"];
  }, []);

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
      />
    );
  } else if (currentSubpage === "notes") {
    currentComponent = <CreationNotes />;
  }

  const handleClick = (pick) => {
    setCurrentSubpage(pick);
    document.title = titleMapping[pick];
  };

  return (
    <section onLoad={() => setLoad(false)} className="creationPart1">
      {load && (
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
          Paintings
        </button>
        {/* <button
          className={`subPageButton ${currentSubpage === "paintings" && "active"}`}
          onClick={() => {
            handleClick("paintings");
          }}
        >
          Paintings
        </button>
        <button
          className={`subPageButton ${currentSubpage === "notes" && "active"}`}
          onClick={() => {
            handleClick("notes");
          }}
        >
          Notes of Nature
        </button> */}
      </div>
      <div className="creationBody">{currentComponent}</div>
    </section>
  );
};
export default Creation;