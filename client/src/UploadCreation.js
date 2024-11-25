import axios from "axios";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import "./uploadCreation.css";

const UploadCreation = () => {
  const navigate = useNavigate();
  const [latinName, setLatinName] = useState("");
  const [chineseName, setChineseName] = useState("");
  const [commonName, setCommonName] = useState("");
  const [location, setLocation] = useState("");
  const [bloomingSeason, setBloomingSeason] = useState("");
  const [fruitingSeason, setFruitingSeason] = useState("");
  const [links, setLinks] = useState("");
  const [chineseLinks, setChineseLinks] = useState("");
  const [picArt, setPicArt] = useState("photography");
  const [namesArray, setNamesArray] = useState("");
  const [linkArray, setLinkArray] = useState([]);
  const [chineseLinkArray, setChineseLinkArray] = useState([]);
  const [username, setUsername] = useState("");
  const [admin, setAdmin] = useState("");
  const [otherNames, setOtherNames] = useState("");
  const [month, setMonth] = useState("");
  const [photographer, setPhotographer] = useState("");
  const [artist, setArtist] = useState("");
  const [artLocation, setArtLocation] = useState([]);
  const [plant, setPlant] = useState([]);
  const [creationPlant, setCreationPlant] = useState("");
  const [creationCreator, setCreationCreator] = useState("");
  const [creationEntries, setCreationEntries] = useState([]);
  const [files, setFiles] = useState([]);
  const [creationPicFile, setCreationPicFile] = useState();
  const [creationArtFile, setCreationArtFile] = useState();
  const [loadingMessage, setLoadingMessage] = useState("");
  const [temp1, setTemp1] = useState();
  const [temp2, setTemp2] = useState();
  const [photoDate, setPhotoDate] = useState();
  const [artDate, setArtDate] = useState();

  const inputRef1 = useRef(null);
  const inputRef2 = useRef(null);
  const inputRef3 = useRef(null);
  const inputRef4 = useRef(null);
  const inputRef5 = useRef(null);
  const inputRef6 = useRef(null);

  const clearInput = () => {
    inputRef1.current.value = "";
    inputRef2.current.value = "";
    inputRef3.current.value = "";
    inputRef4.current.value = "";
    inputRef5.current.value = "";
    inputRef6.current.value = "";
  };

  const unFeature = async (input) => {
    const temp = input;

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_Source_URL}/unFeatureCreation`,
        { temp },
      );
      setCreationEntries(response.data.temp);
    } catch (error) {
      console.log(error);
    }
  };

  const featureOnHome = async (input) => {
    const temp = input;

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_Source_URL}/featureToHome`,
        { temp },
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_Source_URL}/uploadCreation`,
        );
        setCreationEntries(response.data.temp);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_Source_URL}/userInfo`,
        );
        setAdmin(response.data.admin);
        setUsername(response.data.username);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, [admin]);

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

  useEffect(() => {
    if (temp1) {
      var string = temp1.split(", ");
      setPhotographer(string[0]);
      setPhotoDate(string[1]);
    }
  }, [temp1]);

  useEffect(() => {
    if (temp2) {
      var string = temp2.split(", ");
      setArtist(string[0]);
      setArtDate(string[1]);
    }
  }, [temp2]);

  const handleCreationSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("plant", creationPlant);
    formData.append("artDate", artDate);
    formData.append("artist", artist);
    formData.append("photoDate", photoDate);
    formData.append("photographer", photographer);

    const addFileToFormData = (file, fieldName) => {
      if (!file) {
        return false;
      }
      const fileExtension = file.name.split(".").pop();
      if (
        fileExtension !== "jpg" &&
        fileExtension !== "jpeg" &&
        fileExtension !== "png" &&
        fileExtension !== "webp"
      ) {
        alert("Please Upload a jpg, jpeg, png or webp file");
        return false;
      }
      formData.append(fieldName, file);
      return true;
    };

    if (creationPicFile && !addFileToFormData(creationPicFile, "pic")) {
      return;
    }
    if (creationArtFile && !addFileToFormData(creationArtFile, "art")) {
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_Source_URL}/uploadCreation`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      clearInput();
    } catch (error) {
      console.log(error);
    }
  };

  const handleCreationPicChange = (e) => {
    setCreationPicFile(e.target.files[0]);
  };

  const handleCreationArtChange = (e) => {
    setCreationArtFile(e.target.files[0]);
  };

  return (
    <>
      <div className="creationUpload">
        <h1 className="dUpTitle">Creation</h1>
        <form encType="multipart/form-data" onSubmit={handleCreationSubmit}>
          <h2 className="uploadTitle">Documentary Upload</h2>
          <div
            className="creationPic"
            onDragEnter={(e) => e.preventDefault()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              setCreationPicFile(e.dataTransfer.files[0]);
            }}
          >
            <input
              type="text"
              placeholder="Photographer + Creation Date (John Doe, 10-12-07)"
              id="creationPhotographer"
              name="creationPhotographer"
              className="inputBox leftInput"
              onChange={(e) => setTemp1(e.target.value)}
              value={temp1}
              ref={inputRef2}
            />

            <label htmlFor="creationPicFile" className="fileLabel">
              {creationPicFile ? "1 pic selected" : "Click to upload pic"}
            </label>

            <input
              type="file"
              id="creationPicFile"
              name="creationPicFile"
              className="file"
              onChange={handleCreationPicChange}
            />
          </div>

          <br />

          <div
            className="creationArt"
            onDragEnter={(e) => e.preventDefault()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              setCreationArtFile(e.dataTransfer.files[0]);
            }}
          >
            <input
              type="text"
              placeholder="Artist + Creation Date (John Doe, 10-12-07)"
              id="creationArtist"
              name="creationArtist"
              className="inputBox leftInput"
              onChange={(e) => setTemp2(e.target.value)}
              value={temp2}
              ref={inputRef3}
            />

            <label htmlFor="creationArtFile" className="fileLabel">
              {creationArtFile ? "1 art selected" : "Click to upload art"}
            </label>
            <input
              type="file"
              id="creationArtFile"
              name="creationArtFile"
              className="file"
              onChange={handleCreationArtChange}
            />
          </div>

          <br />

          <input
            placeholder="Plant (Latin name)"
            type="text"
            id="creationPlant"
            name="creationPlant"
            value={creationPlant}
            className="inputBox creationUpPlant"
            onChange={(e) => setCreationPlant(e.target.value)}
            ref={inputRef1}
          />
          <br />
          <br />
          <button className="formSubmit" type="submit">
            Submit
          </button>
        </form>

        <br />
        <br />

        <div className="listCreations">
          <h2 className="uploadTitle">Creation Preview</h2>
          {Array.isArray(creationEntries) &&
            creationEntries.map((item, index) => (
              <div key={index}>
                <h3 className="creationTitle">{item.plant}</h3>
                <div className="creationEntry">
                  <img src={item.pic} alt="pic" className="upCreationPic" />
                  <img src={item.art} alt="art" className="upCreationArt" />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      marginTop: "4.5rem",
                    }}
                  >
                    <button
                      className="featureBtn"
                      onClick={() => featureOnHome(item._id)}
                    >
                      Feature on Home
                    </button>
                    <button
                      className="featureBtn"
                      onClick={() => unFeature(item._id)}
                    >
                      Unfeature
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
};

export default UploadCreation;
