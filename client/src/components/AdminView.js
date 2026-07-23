import React, { useState, useEffect } from "react";
import axios from "../api/http";
import urls from "../tools/url";
import { useNavigate } from "react-router-dom";

const AdminView = (previewKey) => {
  const [arts, setArts] = useState([]);
  const [pics, setPics] = useState([]);
  const [displayArts, setDisplayArts] = useState(null);
  const [displayPics, setDisplayPics] = useState(null);
  const [featureStatus, setFeatureStatus] = useState("Feature");
  const [cBM, setCBM] = useState("Plant + Art");
  const [cBT, setCBT] = useState({ Pic: "Pic ", Art: "+ Art" });
  const search = previewKey.search;
  const navigate = useNavigate();

  useEffect(() => {
    const string = `Pic: ${cBT.Pic}  Art: ${cBT.Art}`;
    setCBM(string);
  }, [cBT]);

  const featureStuff = () => {
    setDisplayArts(arts);
    setDisplayPics(pics);
  };

  const makeFeatured = async () => {
    setFeatureStatus("Loading....");
    try {
      await axios.post(
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
    const fetchAdmin = async () => {
      try {
        const response = await axios.get(urls.userInfo);
        if (!response.data.admin) {
          alert("You are not an admin, redirecting to home page...");
          navigate("/");
        }
      } catch (error) {
        console.log(error);
      }
    };

    const fetchData = async () => {
      try {
        await fetchAdmin();
        const response = await axios.post(
          urls.adminView,
          { search: search },
        );
        setArts(response.data.resultArts);
        setPics(response.data.resultPics);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, [navigate, search]);

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
              <img src={pic.path} alt={pic._id} style={{ maxWidth: "20vw" }} />
              <button onClick={() => handlePicChoice(pic)}>Choose</button>
            </>
          ))}
        {displayArts && <h2>Arts</h2>}

        {displayArts &&
          displayArts.map((pic) => (
            <>
              <p>id: {pic._id}</p>
              <img src={pic.path} alt={pic._id} style={{ maxWidth: "20vw" }} />
              <button onClick={() => handleArtChoice(pic)}>Choose</button>
            </>
          ))}
      </div>
    </>
  );
};

export default AdminView;
