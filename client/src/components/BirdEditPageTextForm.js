import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import "../styles/birdEditPageTextForm.css";

const BirdEditPageTextForm = (prop) => {
  const { clearSubpage, post: plant } = prop;
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
  const originalLatin = useState(plant.latinName);


  const [appearance, setAppearance] = useState(plant.appearance);
  const [songs, setSongs] = useState(plant.songs);
  const [diet, setDiet] = useState(plant.diet);
  const [habitat, setHabitat] = useState(plant.habitat);
  const [migration, setMigration] = useState(plant.migration);
  const [breeding, setBreeding] = useState(plant.breeding);
  const [juvChar, setJuvChar] = useState(plant.juvChar);
  const [subChar, setSubChar] = useState(plant.subChar);
  const [madultChar, setMadultChar] = useState(plant.mAdultChar);
  const [fadultChar, setFadultChar] = useState(plant.fAdultChar);


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
      await axios.post(`${process.env.REACT_APP_Source_URL}/birdUpdateText`, {
        latinName,
        chineseName,
        commonName,
        location,
        additionalInfo,
        link: linkArray,
        chineseLink: chineseLinkArray,
        otherNames,
        originalLatin,
        editor: editor,

        appearance,
        songs,
        diet,
        habitat,
        migration,
        breeding,

        juvChar,
        subChar,
        madultChar,
        fadultChar
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
      visible={true}
      onHide={clearSubpage}
      className="edit-dialog"
    >
      <Toast ref={toast} />

      <form onSubmit={handleSubmit} className="p-fluid">
        <div className="grid">
          {/* Names Section */}
          <div className="col-12 grid">
            <div className="col-3">
              <InputText
                value={latinName}
                onChange={(e) => setLatinName(e.target.value)}
                placeholder="Latin Name"
                required
              />
            </div>
            <div className="col-3">
              <InputText
                value={chineseName}
                onChange={(e) => setChineseName(e.target.value)}
                placeholder="Chinese Name"
                required
              />
            </div>
            <div className="col-3">
              <InputText
                value={commonName}
                onChange={(e) => setCommonName(e.target.value)}
                placeholder="Common Name"
                required
              />
            </div>
            <div className="col-3">
              <InputText
                value={otherNames}
                onChange={(e) => setOtherNames(e.target.value)}
                placeholder="Other Names"
              />
            </div>
          </div>

          {/* Secondary Info Section */}
          <div className="col-12 grid">
            <div className="col-6">
              <InputText
                value={appearance}
                onChange={(e) => setAppearance(e.target.value)}
                placeholder="Description"
              />
            </div>
            <div className="col-6">
              <InputText
                value={songs}
                onChange={(e) => setSongs(e.target.value)}
                placeholder="Songs and Calls"
              />
            </div>
          </div>

          <div className="col-12 grid">
            <div className="col-6">
              <InputText
                value={diet}
                onChange={(e) => setDiet(e.target.value)}
                placeholder="Diet and Foraging"
              />
            </div>
            <div className="col-6">
              <InputText
                value={habitat}
                onChange={(e) => setHabitat(e.target.value)}
                placeholder="Habitat"
              />
            </div>
          </div>

          <div className="col-12 grid">
            <div className="col-6">
              <InputText
                value={migration}
                onChange={(e) => setMigration(e.target.value)}
                placeholder="Movement and Migration"
              />
            </div>
            <div className="col-6">
              <InputText
                value={breeding}
                onChange={(e) => setBreeding(e.target.value)}
                placeholder="Breeding"
              />
            </div>
          </div>


          {/* Additional Info Section */}
          {/* <div className="col-12">
            <InputTextarea
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Additional Information"
              autoResize
              rows={5}
            />
          </div> */}

          <div className="col-12">
            <InputTextarea
              value={juvChar}
              onChange={(e) => setJuvChar(e.target.value)}
              placeholder="Juvenile Charateristics"
              autoResize
              rows={5}
            />
          </div>

          <div className="col-12">
            <InputTextarea
              value={subChar}
              onChange={(e) => setSubChar(e.target.value)}
              placeholder="Sub-adult Charateristics"
              autoResize
              rows={5}
            />
          </div>

          <div className="col-12">
            <InputTextarea
              value={madultChar}
              onChange={(e) => setMadultChar(e.target.value)}
              placeholder="Male Adult Charateristics"
              autoResize
              rows={5}
            />
          </div>

          <div className="col-12">
            <InputTextarea
              value={fadultChar}
              onChange={(e) => setFadultChar(e.target.value)}
              placeholder="Female Adult Charateristics"
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

export default BirdEditPageTextForm;
