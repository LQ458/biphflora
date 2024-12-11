import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import urls from "../tools/url.js";

const AdminView = (previewKey) => {
  const [plant, setPlant] = useState();
  const [arts, setArts] = useState([]);
  const [pics, setPics] = useState([]);
  const [displayArts, setDisplayArts] = useState(null);
  const [displayPics, setDisplayPics] = useState(null);
  const [maxWidth, setMaxWidth] = useState("20vw");
  const [featureStatus, setFeatureStatus] = useState("Feature");
  const [cBM, setCBM] = useState("Plant + Art");
  const [cBT, setCBT] = useState({ Pic: "Pic ", Art: "+ Art" });
  const [admin, setAdmin] = useState(false);
  const [username, setUsername] = useState();
  const search = previewKey.search;
  const navigate = useNavigate();

  const fetchAdmin = async () => {
    try {
      const response = await axios.get(
        urls.userInfo,
      );
      setAdmin(response.data.admin);
      if (!response.data.admin) {
        alert("You are not an admin, redirecting to home page...");
        navigate("/");
      }
      setUsername(response.data.username);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const string = "Pic: " + cBT.Pic + "  " + "Art: " + cBT.Art;
    setCBM(string);
  }, [cBT]);

  const featureStuff = () => {
    setDisplayArts(arts);
    setDisplayPics(pics);
  };

  const makeFeatured = async () => {
    setFeatureStatus("Loading....");
    try {
      const response = await axios.post(
        urls.makeFeatured,
        { pic: cBT.Pic, art: cBT.Art, plant: search },
      );
      setFeatureStatus("Done!");
      setTimeout(() => {
        setFeatureStatus("Feature");
      }, 500);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchAdmin();
        const response = await axios.post(
          urls.adminView,
          { search: search },
        );
        setPlant(response.data.resultPlant);
        setArts(response.data.resultArts);
        setPics(response.data.resultPics);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  const handlePicChoice = (pic) => {
    setCBT((prevCBT) => {
      return { ...prevCBT, Pic: pic._id };
    });
  };

  const handleArtChoice = (pic) => {
    setCBT((prevCBT) => {
      return { ...prevCBT, Art: pic._id };
    });
  };

  return (
    <>
      <h1>adminView</h1>
      <button
        onClick={() => {
          navigate("/admin");
        }}
      >
        Back
      </button>
      <h2>{search}</h2>
      <div id="functionsTab">
        <button id="featureAdminBtn" onClick={() => featureStuff()}>
          Feature
        </button>
        <button id="editAdminBtn">Edit</button>
      </div>

      <div id="clipBoard">
        <h2>{cBM}</h2>
        <button id="makeFeatureBtn" onClick={() => makeFeatured()}>
          {featureStatus}
        </button>
      </div>

      <div id="featureBox">
        {displayPics && <h2>Pics</h2>}

        {displayPics &&
          displayPics.map((pic) => (
            <>
              <p>id: {pic._id}</p>
              <img src={pic.path} alt={pic._id} style={{ maxWidth }} />
              <button onClick={() => handlePicChoice(pic)}>Choose</button>
            </>
          ))}
        {displayArts && <h2>Arts</h2>}

        {displayArts &&
          displayArts.map((pic) => (
            <>
              <p>id: {pic._id}</p>
              <img src={pic.path} alt={pic._id} style={{ maxWidth }} />
              <button onClick={() => handleArtChoice(pic)}>Choose</button>
            </>
          ))}
      </div>
    </>
  );
};

export default AdminView;
