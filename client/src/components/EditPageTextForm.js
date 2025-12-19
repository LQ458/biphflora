import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import "../styles/editPageTextForm.css";

const EditPageTextForm = (prop) => {
  const { isVisible, clearSubpage, post: plant } = prop;
  const toast = useRef(null);

  const [latinName, setLatinName] = useState(plant.latinName);
  const [commonName, setCommonName] = useState(plant.commonName);
  const [chineseName, setChineseName] = useState(plant.chineseName);
  const [otherNames, setOtherNames] = useState(plant.otherNames);
  const [additionalInfo, setAdditionalInfo] = useState(plant.additionalInfo);
  const [links, setLinks] = useState(plant.link);
  const [chineseLinks, setChineseLinks] = useState(plant.chineseLink);
  const [editor, setEditor] = useState(plant.editor);
  const [location, setLocation] = useState(plant.location);
  const [linksStringify, setLinksStringify] = useState();
  const [chineseLinksStringify, setChineseLinksStringify] = useState();
  const [linkArray, setLinkArray] = useState([]);
  const [chineseLinkArray, setChineseLinkArray] = useState([]);
  const [loadingMessage, setLoadingMessage] = useState("Submit");
  const originalLatin = plant.latinName;

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
      console.log("Original latin22:")
      console.log(originalLatin)
      await axios.post(`${process.env.REACT_APP_Source_URL}/updateText`, {
        latinName,
        chineseName,
        commonName,
        location,
        additionalInfo,
        link: linkArray,
        chineseLink: chineseLinkArray,
        otherNames,
        originalLatin: originalLatin,
        editor: editor
      });

      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Plant information updated successfully",
      });

      setLoadingMessage("Submit");
      clearSubpage();
    } catch (error) {
      console.log(error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to update plant information",
      });
      setLoadingMessage("Submit");
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
    <Dialog
      header="Edit Text Form"
      visible={isVisible}
      onHide={clearSubpage}
      className="edit-dialog"
    >
      <Toast ref={toast} />

      <form onSubmit={handleSubmit} className="p-fluid">
        <div className="grid">
          {/* Names Section */}
          <div className="col-12 grid">
            <div className="col-4">
              <InputText
                value={latinName}
                onChange={(e) => setLatinName(e.target.value)}
                placeholder="Latin Name"
                required
              />
            </div>
            <div className="col-4">
              <InputText
                value={chineseName}
                onChange={(e) => setChineseName(e.target.value)}
                placeholder="Chinese Name"
                required
              />
            </div>
            <div className="col-4">
              <InputText
                value={commonName}
                onChange={(e) => setCommonName(e.target.value)}
                placeholder="Common Name"
                required
              />
            </div>
          </div>

          {/* Secondary Info Section */}
          <div className="col-12 grid">
            <div className="col-6">
              <InputText
                value={otherNames}
                onChange={(e) => setOtherNames(e.target.value)}
                placeholder="Other Names"
              />
            </div>
            <div className="col-6">
              <InputText
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location"
              />
            </div>
          </div>

          {/* Additional Info Section */}
          <div className="col-12">
            <InputTextarea
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Additional Information"
              autoResize
              rows={5}
            />
          </div>

          {/* Links Section */}
          <div className="col-12">
            <InputText
              value={linksStringify}
              onChange={(e) => setLinksStringify(e.target.value)}
              placeholder="English Links (Format: Title:Link, Title:Link)"
            />
          </div>

          <div className="col-12">
            <InputText
              value={chineseLinksStringify}
              onChange={(e) => setChineseLinksStringify(e.target.value)}
              placeholder="Chinese Links (Format: Title:Link, Title:Link)"
            />
          </div>

          <div className="col-12">
            <InputText
              value={editor}
              onChange={(e) => setEditor(e.target.value)}
              placeholder="Editor: Name Grade"
            />
          </div>

          {/* Submit Button */}
          <div className="col-12">
            <Button
              type="submit"
              label={loadingMessage}
              icon="pi pi-check"
              loading={loadingMessage === "loading..."}
              className="p-button-success edit-button"
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default EditPageTextForm;
