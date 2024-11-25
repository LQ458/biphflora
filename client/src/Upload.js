import axios from "axios";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { useContext } from "react";
import { UserContext } from "./UserContext";
import "./upload.css";
import UploadPlants from "./UploadPlants.js";
import UploadCreation from "./UploadCreation.js";
import UploadHome from "./UploadHome.js";
import Navbar from "./Navbar.js";
import { useLocation } from "react-router-dom";
import AdminAuth from "./AdminAuth.js";

const Upload = () => {
  const navigate = useNavigate();
  const [latinName, setLatinName] = useState("");
  const [chineseName, setChineseName] = useState("");
  const [commonName, setCommonName] = useState("");
  const [location, setLocation] = useState("");
  const [bloomingSeason, setBloomingSeason] = useState("");
  const [fruitingSeason, setFruitingSeason] = useState("");
  const [links, setLinks] = useState("");
  const [chineseLinks, setChineseLinks] = useState("");
  const [editor, setEditor] = useState("");
  const [picEnglishName, setPicEnglishName] = useState("");
  const [picSeason, setPicSeason] = useState("");
  const [picDescription, setPicDescription] = useState("");
  const [picPhotographer, setPicPhotographer] = useState("");
  const [picSetting, setPicSetting] = useState("");
  const [picArt, setPicArt] = useState("photography");
  const [namesArray, setNamesArray] = useState("");
  const [linkArray, setLinkArray] = useState([]);
  const [chineseLinkArray, setChineseLinkArray] = useState([]);
  const [username, setUsername] = useState("");
  const [otherNames, setOtherNames] = useState("");
  const [month, setMonth] = useState("");
  const [artist, setArtist] = useState("");
  const [artLocation, setArtLocation] = useState([]);
  const [plant, setPlant] = useState([]);
  const [creationPlant, setCreationPlant] = useState("");
  const [creationCreator, setCreationCreator] = useState("");
  const [currentSubpage, setCurrentSubpage] = useState("plant");
  const [auth, setAuth] = useState(false);
  const locate = useLocation();

  const { user } = useContext(UserContext);
  const [status, setStatus] = useState(null);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const fetchedStatus = await user.get("status");
      const fetchedAdmin = await user.get("admin");
      setStatus(fetchedStatus);
      setAdmin(fetchedAdmin);
    }

    fetchData();
  }, [user]);

  useEffect(() => {
    const param = new URLSearchParams(locate.search);
    if (param.get("subpage") !== null) {
      setCurrentSubpage(param.get("section"));
    }
  }, [locate.search]);

  useEffect(() => {
    document.title = "Upload 植物信息上传";
  }, []);

  const switchTo = (input) => {
    setCurrentSubpage(input);
  };

  useEffect(() => {
    const authUser = () => {
      if (status === "authenticated") {
        setAuth(true);
      } else if (status === "unauthenticated") {
        alert("Please login to access this page");
        navigate("/");
      }
    };
    authUser();
  }, [navigate, status]);

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
    const splittedLinks = links.split(", ");
    var linkArray = [];
    splittedLinks.forEach((splittedLink) => {
      const linkParts = splittedLink.split(":");
      const linkTitle = linkParts[0];
      const link = linkParts.slice(1).join(":"); // Rejoin the remaining parts into the link
      linkArray.push({
        linkTitle: linkTitle,
        link: link,
      });
    });
    setLinkArray(linkArray);
  }, [links]);

  // const handleCreationSubmit = async (e) => {
  //   e.preventDefault();
  //   const formData = new FormData();
  //   formData.append("plant", creationPlant);
  //   formData.append("creator", creationCreator);

  //   const addFileToFormData = (file, fieldName) => {
  //     if (!file) {
  //       return false;
  //     }
  //     const fileExtension = file.name.split(".").pop();
  //     if (
  //       fileExtension !== "jpg" &&
  //       fileExtension !== "jpeg" &&
  //       fileExtension !== "png" &&
  //       fileExtension !== "webp"
  //     ) {
  //       alert("Please Upload a jpg, jpeg, png or webp file");
  //       return false;
  //     }
  //     formData.append(fieldName, file);
  //     return true;
  //   };

  //   if (creationPicFile && !addFileToFormData(creationPicFile, "pic")) {
  //     return;
  //   }
  //   if (creationArtFile && !addFileToFormData(creationArtFile, "art")) {
  //     return;
  //   }

  //   try {
  //     const response = await axios.post(
  //       `${process.env.REACT_APP_Source_URL}/uploadCreation`,
  //       formData,
  //       {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //         },
  //       },
  //     );
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  useEffect(() => {
    const splittedLinks = chineseLinks.split(", ");
    var linkArray = [];
    splittedLinks.forEach((splittedLink) => {
      const linkParts = splittedLink.split(":");
      const linkTitle = linkParts[0];
      const link = linkParts.slice(1).join(":"); // Rejoin the remaining parts into the link
      linkArray.push({
        linkTitle: linkTitle,
        link: link,
      });
    });
    setChineseLinkArray(linkArray);
  }, [chineseLinks]);

  // const handleFileChange = (e) => {
  //   setFiles(e.target.files);
  // };

  // const handleArtSubmit = async (e) => {
  //   e.preventDefault();

  //   setLoadingMessage("loading");

  //   const formData = new FormData();
  //   formData.append("plant", plant);
  //   formData.append("artist", artist);
  //   formData.append("artLocation", artLocation);

  //   if (files) {
  //     for (let i = 0; i < files.length; i++) {
  //       const file = files[i];
  //       const fileExtension = file.name.split(".").pop();
  //       if (
  //         fileExtension !== "jpg" &&
  //         fileExtension !== "jpeg" &&
  //         fileExtension !== "png" &&
  //         fileExtension !== "webp"
  //       ) {
  //         alert("Please upload a jpg, jpeg, png or webp file");
  //         return;
  //       }
  //       formData.append("files", file);
  //     }
  //   }

  //   try {
  //     const response = await axios.post(
  //       `${process.env.REACT_APP_Source_URL}/uploadArt`,
  //       formData,
  //       {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //         },
  //       },
  //     );
  //     window.location.reload();
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   setLoadingMessage("loading");
  //   const formData = new FormData();
  //   formData.append("latinName", latinName);
  //   formData.append("chineseName", chineseName);
  //   formData.append("location", location);
  //   formData.append("bloomingSeason", bloomingSeason);
  //   formData.append("commonName", commonName);
  //   formData.append("editor", editor);
  //   formData.append("link", JSON.stringify(linkArray));
  //   formData.append("chineseLink", JSON.stringify(chineseLinkArray));
  //   formData.append("otherNames", otherNames);

  //   try {
  //     const response = await axios.post(
  //       `${process.env.REACT_APP_Source_URL}/upload`,
  //       formData,
  //       {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //         },
  //       },
  //     );
  //     window.location.reload();
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  // const handleCreationPicChange = (e) => {
  //   setCreationPicFile(e.target.files[0]);
  // };

  // const handleCreationArtChange = (e) => {
  //   setCreationArtFile(e.target.files[0]);
  // };

  // const handlePicSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoadingMessage("Loading...");
  //   const formData = new FormData();

  //   formData.append("picEnglishName", picEnglishName);
  //   formData.append("picSeason", picSeason);
  //   formData.append("picDescription", picDescription);
  //   formData.append("picPhotographer", picPhotographer);
  //   formData.append("picSetting", picSetting);
  //   formData.append("picArt", picArt);
  //   formData.append("month", month);

  //   if (files) {
  //     for (let i = 0; i < files.length; i++) {
  //       const file = files[i];
  //       const fileExtension = file.name.split(".").pop();
  //       if (
  //         fileExtension !== "jpg" &&
  //         fileExtension !== "jpeg" &&
  //         fileExtension !== "png" &&
  //         fileExtension !== "webp"
  //       ) {
  //         alert("Please upload a jpg, jpeg, png or webp file");
  //         return;
  //       }
  //       formData.append("files", file);
  //     }
  //   }

  //   try {
  //     const response = await axios.post(
  //       `${process.env.REACT_APP_Source_URL}/uploadPic`,
  //       formData,
  //       {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //         },
  //       },
  //     );
  //     window.location.reload();
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  return auth ? (
    <section className="upload">
      <Navbar />
      <section className="uploadBody">
        <div className="topBtns">
          <button
            className={`${currentSubpage === "home" && "focused"}`}
            onClick={() => switchTo("home")}
          >
            Home
          </button>
          <button
            className={`${currentSubpage === "plant" && "focused"}`}
            onClick={() => switchTo("plant")}
          >
            Database
          </button>
          <button
            className={`${currentSubpage === "creation" && "focused"} creation`}
            onClick={() => switchTo("creation")}
          >
            Creation and Activities
          </button>
          {admin && (
            <button
              className={`${currentSubpage === "auth" && "focused"}`}
              onClick={() => switchTo("auth")}
            >
              Admin Authentication
            </button>
          )}
        </div>

        {currentSubpage === "plant" ? (
          <UploadPlants />
        ) : currentSubpage === "creation" ? (
          <UploadCreation />
        ) : currentSubpage === "home" ? (
          <UploadHome />
        ) : currentSubpage === "auth" ? (
          <AdminAuth admin={admin} />
        ) : (
          <UploadPlants />
        )}
      </section>
    </section>
  ) : (
    <section className="loadingBG">
      <div className="dots-container">
        <div className="dots"></div>
        <div className="dots"></div>
        <div className="dots"></div>
        <div className="dots"></div>
        <div className="dots"></div>
      </div>
    </section>
  );
};

export default Upload;
