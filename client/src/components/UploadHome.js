import React, { useState, useEffect, useRef } from "react";
import { Dropdown } from "primereact/dropdown";
import { DataView } from "primereact/dataview";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import axios from "axios";
import "../styles/uploadHome.css";

const PictureGrid = ({ items, selectedItem, onSelect }) => {
  return (
    <div className="picture-grid">
      {items.map((item) => (
        <div
          key={item._id}
          className={`picture-item ${selectedItem?._id === item._id ? "selected" : ""}`}
          onClick={() => onSelect(item)}
        >
          <img
            src={`${process.env.REACT_APP_Source_URL}/public${item.path}`}
            alt={item.plant}
          />
          <div className="mt-2">
            <p>Photographer: {item.takenBy}</p>
            <p>Date: {item.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

const ArtGrid = ({ items, selectedItem, onSelect }) => {
  return (
    <div className="art-grid">
      {items.map((item) => (
        <div
          key={item._id}
          className={`art-item ${selectedItem?._id === item._id ? "selected" : ""}`}
          onClick={() => onSelect(item)}
        >
          <img
            src={`${process.env.REACT_APP_Source_URL}/public${item.path}`}
            alt={item.plant}
          />
          <div className="mt-2">
            <p>Artist: {item.artist}</p>
            <p>Location: {item.location}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

const UploadHome = () => {
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [plants, setPlants] = useState([]);
  const [pics, setPics] = useState([]);
  const [arts, setArts] = useState([]);
  const [selectedPic, setSelectedPic] = useState(null);
  const [selectedArt, setSelectedArt] = useState(null);
  const [homeEntries, setHomeEntries] = useState([]);
  const [showPicDialog, setShowPicDialog] = useState(false);
  const [showArtDialog, setShowArtDialog] = useState(false);
  const toast = useRef(null);

  // 获取植物列表
  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_Source_URL}/searchNames`,
        );
        setPlants(
          response.data.returnNames.map((plant) => ({
            label: plant.latinName,
            value: plant.latinName,
          })),
        );
      } catch (error) {
        console.error(error);
      }
    };
    fetchPlants();
  }, []);

  // 获取已featured的条目
  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_Source_URL}/uploadHome`,
        );
        setHomeEntries(response.data.entries || []);
      } catch (error) {
        console.error(error);
        setHomeEntries([]);
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to load featured items",
        });
      }
    };
    fetchFeatures();
  }, []);

  // 当选择植物时获取对应的pics和arts
  useEffect(() => {
    const fetchPicsAndArts = async () => {
      if (selectedPlant) {
        try {
          const response = await axios.post(
            `${process.env.REACT_APP_Source_URL}/getPicsAndArts`,
            { plant: selectedPlant },
          );
          setPics(response.data.pics);
          setArts(response.data.arts);
        } catch (error) {
          console.error(error);
        }
      }
    };
    fetchPicsAndArts();
  }, [selectedPlant]);

  const handleFeature = async () => {
    if (!selectedPic || !selectedArt) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Please select both a picture and an artwork",
      });
      return;
    }

    // 检查是否已经存在相同的 feature 组合
    const existingFeature = homeEntries.find(
      (entry) =>
        entry.works.pic._id === selectedPic._id &&
        entry.works.art._id === selectedArt._id,
    );

    if (existingFeature) {
      toast.current.show({
        severity: "warn",
        summary: "Warning",
        detail:
          "This combination has already been featured. You can continue if this is intentional.",
        life: 3000,
      });
    }

    try {
      await axios.post(`${process.env.REACT_APP_Source_URL}/featureToHome`, {
        picId: selectedPic._id,
        artId: selectedArt._id,
      });

      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Featured successfully",
      });

      // 刷新列表
      const response = await axios.get(
        `${process.env.REACT_APP_Source_URL}/uploadHome`,
      );
      setHomeEntries(response.data.entries || []);

      // 重置选择
      setSelectedPic(null);
      setSelectedArt(null);
      setSelectedPlant(null);
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to feature",
      });
    }
  };

  const handleUnfeature = async (id) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_Source_URL}/unFeatureHome`,
        { id },
      );
      if (response.data.success) {
        setHomeEntries(response.data.entries || []);
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Unfeatured successfully",
        });
      }
    } catch (error) {
      console.error("Error in handleUnfeature:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to unfeature",
      });
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <h1 className="homeTitle">Home</h1>

      <div className="card">
        <h2>Feature New</h2>
        <div className="grid">
          <div className="col-12">
            <Dropdown
              value={selectedPlant}
              options={plants}
              onChange={(e) => setSelectedPlant(e.value)}
              placeholder="Select a Plant"
              className="w-full"
            />
          </div>

          {selectedPlant && (
            <>
              <div className="col-12">
                <h3>Select a Picture</h3>
                <PictureGrid
                  items={pics}
                  selectedItem={selectedPic}
                  onSelect={setSelectedPic}
                />
              </div>

              <div className="col-12">
                <h3>Select an Artwork</h3>
                <ArtGrid
                  items={arts}
                  selectedItem={selectedArt}
                  onSelect={setSelectedArt}
                />
              </div>

              <div className="col-12">
                <Button
                  label="Feature Selected Items"
                  onClick={handleFeature}
                  disabled={!selectedPic || !selectedArt}
                  className="w-full"
                  severity="success"
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="card">
        <h2>Currently Featured</h2>
        <div className="grid">
          {homeEntries.map((entry, index) => (
            <div key={index} className="col-12 md:col-6 lg:col-4">
              <div className="featured-entry">
                <h3>{entry.works?.pic?.plant}</h3>
                <div className="grid">
                  <div className="col-6">
                    <img
                      src={`${process.env.REACT_APP_Source_URL}/public${entry.works?.pic?.path}`}
                      alt={entry.works?.pic?.plant}
                      className="w-full"
                    />
                  </div>
                  <div className="col-6">
                    <img
                      src={`${process.env.REACT_APP_Source_URL}/public${entry.works?.art?.path}`}
                      alt={entry.works?.art?.plant}
                      className="w-full"
                    />
                  </div>
                </div>
                <Button
                  label="Unfeature"
                  onClick={() => handleUnfeature(entry._id)}
                  className="p-button-danger w-full mt-2"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog
        visible={showPicDialog}
        onHide={() => setShowPicDialog(false)}
        maximizable
      >
        {selectedPic && (
          <img
            src={`${process.env.REACT_APP_Source_URL}/public${selectedPic.path}`}
            alt={selectedPic.plant}
            style={{ maxWidth: "100%" }}
          />
        )}
      </Dialog>

      <Dialog
        visible={showArtDialog}
        onHide={() => setShowArtDialog(false)}
        maximizable
      >
        {selectedArt && (
          <img
            src={`${process.env.REACT_APP_Source_URL}/public${selectedArt.path}`}
            alt={selectedArt.plant}
            style={{ maxWidth: "100%" }}
          />
        )}
      </Dialog>
    </>
  );
};

export default UploadHome;
