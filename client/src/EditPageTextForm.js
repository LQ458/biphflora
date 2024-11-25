import axios from "axios";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import levenshtein from "fast-levenshtein";
import { Link } from "react-router-dom";
import "./editPageTextForm.css";
import { ReactComponent as SearchIcon } from "./buttons/search-outline.svg";
import { useHistory } from "react-router-dom";

const EditPageTextForm = (prop) => {
  const clearSubpage = prop.clearSubpage;
  const plant = prop.post;

  const [latinName, setLatinName] = useState(plant.latinName);
  const [commonName, setCommonName] = useState(plant.commonName);
  const [chineseName, setChineseName] = useState(plant.chineseName);
  const [otherNames, setOtherNames] = useState(plant.otherNames);
  const [additionalInfo, setAdditionalInfo] = useState(plant.additionalInfo);
  const [links, setLinks] = useState(plant.link);
  const [chineseLinks, setChineseLinks] = useState(plant.chineseLinks);
  const [location, setLocation] = useState(plant.location);
  const [linksStringify, setLinksStringify] = useState();
  const [chineseLinksStringify, setChineseLinksStringify] = useState();
  const [linkArray, setLinkArray] = useState([]);
  const [chineseLinkArray, setChineseLinkArray] = useState([]);
  const [loadingMessage, setLoadingMessage] = useState("Submit");
  const originalLatin = useState(plant.latinName);

  useEffect(() => {
    if (Array.isArray(links) && links.length > 0) {
      const formattedString = links
        .map(
          (link) => `${link.linkTitle ? link.linkTitle + ":" : ""}${link.link}`,
        )
        .join(", ");
      setLinksStringify(formattedString);
    }

    if (Array.isArray(chineseLinks) && chineseLinks.length > 0) {
      const formattedChineseString = chineseLinks
        .map(
          (link) => `${link.linkTitle ? link.linkTitle + ":" : ""}${link.link}`,
        )
        .join(", ");
      setChineseLinksStringify(formattedChineseString);
    }
  }, [chineseLinks, links]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoadingMessage("loading...");

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_Source_URL}/updateText`,
        {
          latinName: latinName,
          chineseName: chineseName,
          commonName: commonName,
          additionalInfo: additionalInfo,
          link: linkArray,
          chineseLink: chineseLinkArray,
          otherNames: otherNames,
          originalLatin: originalLatin,
        },
      );
      setLoadingMessage("Submit");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const splittedLinks = linksStringify ? linksStringify.split(", ") : [];
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
  }, [linksStringify]);

  useEffect(() => {
    const splittedLinks = chineseLinksStringify
      ? chineseLinksStringify.split(", ")
      : [];
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
  }, [chineseLinksStringify]);
  return (
    <>
      <h1>Edit Text Form</h1>
      <button
        onClick={() => {
          clearSubpage();
        }}
      >
        x
      </button>
      <br />
      <br />
      <form encType="multipart/form-data" onSubmit={handleSubmit}>
        <div className="form-group">
          <div className="namesEdit">
            <input
              type="text"
              id="latinName"
              name="latinName"
              placeholder={latinName}
              className="inputBox"
              value={latinName}
              onChange={(e) => setLatinName(e.target.value)}
              required
            />
            <input
              type="text"
              id="chineseName"
              name="chineseName"
              placeholder={chineseName}
              className="inputBox"
              value={chineseName}
              onChange={(e) => setChineseName(e.target.value)}
              required
            />
            <input
              type="text"
              id="commonName"
              name="commonName"
              placeholder="Common Name"
              className="inputBox"
              value={commonName}
              onChange={(e) => setCommonName(e.target.value)}
              required
            />
          </div>
          <br />
          <div className="secEdit">
            <input
              type="text"
              id="otherNames"
              name="otherNames"
              placeholder={otherNames}
              className="inputBox"
              value={otherNames}
              onChange={(e) => setOtherNames(e.target.value)}
            />
            <input
              type="text"
              id="location"
              name="location"
              placeholder={location}
              className="inputBox"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <br />
          <textarea
            id="additionalInfo"
            name="additionalInfo"
            placeholder={additionalInfo}
            className="inputBox additionalInfoBox"
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
          />
        </div>
        <br />
        <input
          type="text"
          id="links"
          name="links"
          placeholder={linksStringify}
          className="inputBox linksBox"
          value={linksStringify}
          onChange={(e) => setLinksStringify(e.target.value)}
        />
        <br />
        <br />

        <input
          type="text"
          id="chineseLinks"
          name="chineseLinks"
          className="inputBox linksBox"
          value={chineseLinksStringify}
          onChange={(e) => setChineseLinksStringify(e.target.value)}
        />
        <br />

        <button type="submit" className="formSubmit">
          {loadingMessage}
        </button>
      </form>
    </>
  );
};

export default EditPageTextForm;
