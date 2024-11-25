import axios from "axios";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import levenshtein from "fast-levenshtein";
import { Link } from "react-router-dom";
import styles from "./db3.css";
import { ReactComponent as SearchIcon } from "./buttons/search-outline.svg";
import { useHistory } from "react-router-dom";

const CreationView = (prop) => {
  const post = prop.vKey;
  const handleView = prop.handleView;

  return (
    <>
      <h1>{post.plant}</h1>
      <img src={post.pic} />
      <img src={post.art} />
      <p className="infoBoxForCreationView">{post.bottomInfo}</p>
      <button
        style={{ textDecoration: "underline" }}
        onClick={() => {
          handleView("");
        }}
      >
        back
      </button>
    </>
  );
};

export default CreationView;
