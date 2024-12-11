import axios from "axios";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { useContext } from "react";
import { UserContext } from "../UserContext";
import "../styles/upload.css";
import UploadPlants from "../components/UploadPlants.js";
import UploadCreation from "../components/UploadCreation.js";
import UploadHome from "../components/UploadHome.js";
import Navbar from "../components/Navbar.js";
import { useLocation } from "react-router-dom";
import AdminAuth from "../components/AdminAuth.js";
import urls from "../tools/url.js";

const Upload = () => {
  const navigate = useNavigate();
  const [links, setLinks] = useState("");
  const [chineseLinks, setChineseLinks] = useState("");
  const [namesArray, setNamesArray] = useState("");
  const [linkArray, setLinkArray] = useState([]);
  const [chineseLinkArray, setChineseLinkArray] = useState([]);
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
        navigate("/");
      }
    };
    authUser();
  }, [navigate, status]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(urls.searchNames);
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
