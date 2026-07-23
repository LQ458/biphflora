import axios from "../api/http";
import urls, { mediaUrl } from "../tools/url";
import React, { useState, useEffect, useRef } from "react";
import "../styles/uploadCreation.css";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { FileUpload } from "primereact/fileupload";
import { Dropdown } from "primereact/dropdown";
import { getCatalogNames } from "../api/catalog";

const UploadCreation = () => {
  const [namesArray, setNamesArray] = useState([]);
  const [admin, setAdmin] = useState("");
  const [photographer, setPhotographer] = useState("");
  const [artist, setArtist] = useState("");
  const [location, setLocation] = useState("");
  const [creationPlant, setCreationPlant] = useState("");
  const [creationEntries, setCreationEntries] = useState([]);
  const [creationPicFile, setCreationPicFile] = useState();
  const [creationArtFile, setCreationArtFile] = useState();
  const [temp1, setTemp1] = useState();
  const [temp2, setTemp2] = useState();
  const [photoDate, setPhotoDate] = useState();
  const [artDate, setArtDate] = useState();
  const [creationLoading, setCreationLoading] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const toast = useRef(null);

  const clearInput = () => {
    setCreationPlant("");
    setCreationPicFile(null);
    setCreationArtFile(null);
    setTemp1("");
    setTemp2("");
    setPhotoDate("");
    setArtDate("");
    setLocation("");
  };

  const handleFeature = async (entry) => {
    try {
      await axios.post(urls.featureToHome, {
        picId: entry._id,
        artId: entry._id,
        isCreation: true,
      });

      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Featured successfully",
        life: 3000,
      });

      setShowPreviewDialog(false);
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to feature",
        life: 3000,
      });
    }
  };

  const unFeature = async (input) => {
    try {
      const response = await axios.post(
        urls.unFeatureCreation,
        { temp: input },
      );
      setCreationEntries(response.data.temp);
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Unfeatured successfully",
        life: 3000,
      });
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to unfeature",
        life: 3000,
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          urls.uploadCreation,
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
        const response = await axios.get(urls.userInfo);
        setAdmin(response.data.admin);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, [admin]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedNamesArray = (await getCatalogNames("plant")).map((result) => {
          return {
            value: result.latinName,
          };
        });
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
    setCreationLoading(true);
    const formData = new FormData();
    formData.append("plant", creationPlant);
    formData.append("artDate", artDate);
    formData.append("artist", artist);
    formData.append("photoDate", photoDate);
    formData.append("photographer", photographer);
    formData.append("artLocation", location)
    
    const formArt = new FormData();
    formArt.append("plant", creationPlant);
    formArt.append("artDate", artDate);
    formArt.append("artist", artist);
    formArt.append("photoDate", photoDate);
    formArt.append("photographer", photographer);
    formArt.append("artLocation", location)


    console.error("starting to submit")
    if (creationPicFile && creationArtFile){
      formData.append("pic", creationPicFile);
      formData.append("art", creationArtFile);
      formArt.append("files",creationArtFile);
    }

    else if (creationArtFile){
      formArt.append("files",creationArtFile);
    }

    else{
      toast.current.show({
        severity: "error",
        summary: "上传失败",
        detail: "请上传至少一张绘画",
        life: 3000,
      });
      
      setCreationLoading(false);
      return;
    }

    try {
      if (!(creationPicFile && creationArtFile)){
        await axios.post(
          urls.uploadArt,
          formArt,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        );
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Creation uploaded successfully",
          life: 3000,
        });
        clearInput();
      }
      else{
        console.log(`both processing`)

        await axios.post(
          urls.uploadArt,
          formArt,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        )

        await axios.post(
          urls.uploadCreation,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        );
        
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Creation uploaded successfully",
          life: 3000,
        });
        clearInput();
      }
      
    } catch (error) {
      console.log(error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to upload creation",
        life: 3000,
      });
    } finally {
      setCreationLoading(false);
    }
  };

  const selectedPicEnglishNameTemplate = (option, props) => {
    if (option) {
      return (
        <div className="flex align-items-center">
          <div>{option.value}</div>
        </div>
      );
    }

    return <span>{props.placeholder}</span>;
  };

  const picEnglishNameOptionTemplate = (option) => {
    return (
      <div className="flex align-items-center">
        <div>{option.value}</div>
      </div>
    );
  };

  return (
    <>
      <Toast ref={toast} />
      <div className="creationUpload">
        <h1 className="dUpTitle">Creation</h1>
        <form encType="multipart/form-data" onSubmit={handleCreationSubmit}>
          <h2 className="uploadTitle">Documentary Upload</h2>
          <div className="creationPic">
            <InputText
              type="text"
              placeholder="Photographer + Creation Date (John Doe, 10-12-07)"
              id="creationPhotographer"
              name="creationPhotographer"
              className="inputBox leftInput"
              style={{
                borderRadius: "0",
                border: "2px solid #516d4e",
              }}
              onChange={(e) => setTemp1(e.target.value)}
              value={temp1}
            />

            <FileUpload
              mode="basic"
              name="pic"
              accept="image/*"
              maxFileSize={10000000}
              chooseLabel={
                creationPicFile ? "1 pic selected" : "Click to upload pic"
              }
              className="p-button-outlined"
              onSelect={(e) => setCreationPicFile(e.files[0])}
            />
          </div>

          <br />

          <div className="creationArt">
            <InputText
              type="text"
              placeholder="Artist + Creation Date (John Doe, 10-12-07)"
              id="creationArtist"
              name="creationArtist"
              className="inputBox leftInput"
              style={{
                borderRadius: "0",
                border: "2px solid #516d4e",
              }}
              onChange={(e) => setTemp2(e.target.value)}
              value={temp2}
            />

            <FileUpload
              mode="basic"
              name="art"
              accept="image/*"
              maxFileSize={10000000}
              chooseLabel={
                creationArtFile ? "1 art selected" : "Click to upload art"
              }
              className="p-button-outlined"
              onSelect={(e) => setCreationArtFile(e.files[0])}
            />
          </div>

          <br/>

          <div className="location">
            <InputText
                type="text"
                placeholder="Location"
                id="artLocation"
                name="location"
                gap="2vw"
                className="inputBox leftInput"
                style={{
                  borderRadius: "0",
                  border: "2px solid #516d4e",
                }}
                onChange={(e) => setLocation(e.target.value)}
                value={location}
            />
          </div>
          

          <br/>
          <Dropdown
              style={{
                borderRadius: "0",
                border: "2px solid #516d4e",
                padding: "0",
              }}
              value={creationPlant}
              className="inputBox creationUpPlant"
              onChange={(e) => setCreationPlant(e.value)}
              options={namesArray}
              optionLabel="value"
              placeholder="Plant (Latin name) Type to search"
              filter
              valueTemplate={selectedPicEnglishNameTemplate}
              itemTemplate={picEnglishNameOptionTemplate}
            />
            
        
          
          
          <br />
          <br />
          <Button
            className="formSubmit"
            type="submit"
            label="Submit"
            icon="pi pi-check"
            style={{ borderRadius: "0" }}
            loading={creationLoading}
          />
        </form>

        <br />
        <br />

        <div className="listCreations">
          <h2 className="uploadTitle">Creation Preview</h2>
          <div className="grid">
            {Array.isArray(creationEntries) &&
              creationEntries.map((item, index) => (
                <div key={index} className="col-12 md:col-6 lg:col-4">
                  <div className="creation-entry p-4">
                    <h3 className="creationTitle">{item.plant}</h3>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <img
                          src={mediaUrl(item.pic, { compressed: true })}
                          alt="pic"
                          className="w-full"
                        />
                      </div>
                      <div className="flex-1">
                        <img
                          src={mediaUrl(item.art, { compressed: true })}
                          alt="art"
                          className="w-full"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        label="Feature on Home"
                        icon="pi pi-star"
                        onClick={() => {
                          setSelectedEntry(item);
                          setShowPreviewDialog(true);
                        }}
                        className="p-button-success"
                      />
                      <Button
                        label="Delete"
                        icon="pi pi-times"
                        onClick={() => unFeature(item._id)}
                        className="p-button-danger"
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <Dialog
        visible={showPreviewDialog}
        onHide={() => setShowPreviewDialog(false)}
        header="Preview and Confirm Feature"
        style={{ width: "50vw" }}
      >
        {selectedEntry && (
          <div>
            <div className="flex gap-3 mb-3">
              <div className="flex-1">
                <img
                  src={mediaUrl(selectedEntry.pic, { compressed: true })}
                  alt="pic"
                  className="w-full"
                />
              </div>
              <div className="flex-1">
                <img
                  src={mediaUrl(selectedEntry.art, { compressed: true })}
                  alt="art"
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex justify-content-end">
              <Button
                label="Confirm Feature"
                icon="pi pi-check"
                onClick={() => handleFeature(selectedEntry)}
                className="p-button-success"
              />
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
};

export default UploadCreation;
