import axios from "axios";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import { FileUpload } from "primereact/fileupload";
import { Toast } from "primereact/toast";
import "./uploadPlants.css";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import imageCompression from "browser-image-compression";

const UploadPlants = () => {
  const [latinName, setLatinName] = useState("");
  const [chineseName, setChineseName] = useState("");
  const [commonName, setCommonName] = useState("");
  const [location, setLocation] = useState("");
  const [bloomingSeason, setBloomingSeason] = useState("");
  const [links, setLinks] = useState("");
  const [chineseLinks, setChineseLinks] = useState("");
  const [editor, setEditor] = useState("");
  const [picEnglishName, setPicEnglishName] = useState("");
  const [picSeason, setPicSeason] = useState("");
  const [picPhotographer, setPicPhotographer] = useState("");
  const [picSetting, setPicSetting] = useState("");
  const [picArt, setPicArt] = useState("photography");
  const [namesArray, setNamesArray] = useState([]);
  const [linkArray, setLinkArray] = useState([]);
  const [chineseLinkArray, setChineseLinkArray] = useState([]);
  const [username, setUsername] = useState("");
  const [admin, setAdmin] = useState("");
  const [otherNames, setOtherNames] = useState("");
  const [month, setMonth] = useState("");
  const [artist, setArtist] = useState("");
  const [artLocation, setArtLocation] = useState([]);
  const [plant, setPlant] = useState([]);
  const [artFiles, setArtFiles] = useState([]);
  const [picFiles, setPicFiles] = useState([]);
  const [plantLoading, setPlantLoading] = useState(false);
  const [picLoading, setPicLoading] = useState(false);
  const [artLoading, setArtLoading] = useState(false);

  const fileUploadRef = useRef(null);
  const artFileUploadRef = useRef(null);
  const toast = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userInfoResponse = await axios.get(
          `${process.env.REACT_APP_Source_URL}/userInfo`,
        );
        const searchNamesResponse = await axios.get(
          `${process.env.REACT_APP_Source_URL}/searchNames`,
        );
        const fetchedNamesArray = searchNamesResponse.data.returnNames.map(
          (result) => {
            return {
              value: result.latinName,
            };
          },
        );
        setNamesArray(fetchedNamesArray);
        setAdmin(userInfoResponse.data.admin);
        setUsername(userInfoResponse.data.username);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []); // Fetch data from the server

  const selectedPicEnglishNameTemplate = (option, props) => {
    if (option) {
      return (
        <div className="flex align-items-center">
          <div>{option.value}</div>
        </div>
      );
    }

    return <span>{props.placeholder}</span>;
  }; // Template for the dropdown

  const seasons = [
    { value: "spring" },
    { value: "summer" },
    { value: "autumn" },
    { value: "winter" },
  ]; // Season options

  const picEnglishNameOptionTemplate = (option) => {
    return (
      <div className="flex align-items-center">
        <div>{option.value}</div>
      </div>
    );
  };

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

  const handleArtFileChange = (e) => {
    try {
      setArtFiles(e.files);
      if (artFileUploadRef.current) {
        artFileUploadRef.current.clear();
      }
    } catch (error) {
      console.error("File upload failed", error);
    }
  };

  const handlePicFileChange = (e) => {
    try {
      // Assume uploadFiles is a function that uploads the files and returns a promise
      setPicFiles(e.files);
      // Trigger the onUpload event manually
      if (fileUploadRef.current) {
        fileUploadRef.current.clear();
      }
    } catch (error) {
      console.error("File upload failed", error);
    }
  };

  const handlePlantSubmit = async (e) => {
    e.preventDefault();
    setPlantLoading(true);

    const formData = new FormData();
    formData.append("latinName", latinName);
    formData.append("chineseName", chineseName);
    formData.append("location", location);
    formData.append("bloomingSeason", bloomingSeason);
    formData.append("commonName", commonName);
    formData.append("editor", editor);
    formData.append("link", JSON.stringify(linkArray));
    formData.append("chineseLink", JSON.stringify(chineseLinkArray));
    formData.append("otherNames", otherNames);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_Source_URL}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      toast.current.show({
        severity: "success",
        summary: "创建成功",
        detail: "植物创建成功",
        life: 3000,
      });
      setLatinName("");
      setChineseName("");
      setCommonName("");
      setLocation("");
      setBloomingSeason("");
      setOtherNames("");
      setLinks("");
      setChineseLinks("");
      setEditor("");
    } catch (error) {
      console.log(error);
    } finally {
      setPlantLoading(false);
    }
  };

  const handlePicSubmit = async (e) => {
    e.preventDefault();
    setPicLoading(true);
    const formData = new FormData();

    // 添加基本信息
    const basicInfo = {
      picEnglishName,
      picSeason,
      picPhotographer,
      picSetting,
      picArt,
      month: month.toString().match(/^(\S+\s+\S+\s+\S+\s+\S+)/)[0],
    };

    Object.entries(basicInfo).forEach(([key, value]) => {
      formData.append(key, value);
    });

    if (picFiles.length === 0) {
      toast.current.show({
        severity: "error",
        summary: "上传失败",
        detail: "请上传至少一张图片",
        life: 3000,
      });
      setPicLoading(false);
      return;
    }

    try {
      // 压缩选项
      const options = {
        maxWidthOrHeight: 800,
        useWebWorker: true,
        initialQuality: 0.9,
        fileType: "image/png", // 指定输出格式为 PNG
      };

      toast.current.show({
        severity: "info",
        summary: "处理中",
        detail: "正在处理图片，请稍候...",
        life: 3000,
      });

      // 修改压缩函数以确保正确的文件格式
      const compressFile = async (file, index) => {
        try {
          // 检查文件类型
          const fileType = file.type;
          const validTypes = ["image/jpeg", "image/png", "image/webp"];

          if (!validTypes.includes(fileType)) {
            throw new Error("不支持的文件格式");
          }

          const compressedFile = await imageCompression(file, options);

          // 确保文件以正确的格式和扩展名返回
          const fileName = file.name.split(".")[0]; // 获取文件名（不含扩展名）
          const newFile = new File(
            [compressedFile],
            `${fileName}.png`, // 使用 PNG 扩展名
            {
              type: "image/png",
              lastModified: new Date().getTime(),
            },
          );

          console.log(`已处理 ${index + 1}/${picFiles.length} 张图片`);
          return newFile;
        } catch (error) {
          console.error("图片处理失败", error);
          toast.current.show({
            severity: "error",
            summary: "处理失败",
            detail: error.message || "图片处理失败，请重试",
            life: 3000,
          });
          throw error; // 抛出错误以中断处理
        }
      };

      // 并行处理所有文件
      const compressedFiles = await Promise.all(
        Array.from(picFiles).map((file, index) => compressFile(file, index)),
      ).catch((error) => {
        setPicLoading(false);
        throw error; // 重新抛出错误以中断上传
      });

      // 检查是否所有文件都处理成功
      if (!compressedFiles || compressedFiles.some((file) => !file)) {
        throw new Error("部分图片处理失败");
      }

      // 将处理后的文件添加到 formData
      compressedFiles.forEach((file) => {
        formData.append("files", file);
      });

      // 上传文件
      await axios.post(
        `${process.env.REACT_APP_Source_URL}/uploadPic`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            console.log(`上传进度: ${percentCompleted}%`);
          },
        },
      );

      toast.current.show({
        severity: "success",
        summary: "上传成功",
        detail: "所有图片上传成功",
        life: 3000,
      });

      // 重置表单
      setPicFiles([]);
      setPicEnglishName("");
      setPicSeason("");
      setPicPhotographer("");
      setPicSetting("");
      setMonth("");
    } catch (error) {
      console.error("上传错误", error);
      if (error.response?.status === 404) {
        toast.current.show({
          severity: "error",
          summary: "上传失败",
          detail: "请选择列表中的植物",
          life: 3000,
        });
      } else {
        toast.current.show({
          severity: "error",
          summary: "上传失败",
          detail: error.message || "请重试",
          life: 3000,
        });
      }
    } finally {
      setPicLoading(false);
    }
  };

  const handleArtSubmit = async (e) => {
    e.preventDefault();
    setArtLoading(true);

    const formData = new FormData();
    formData.append("plant", plant);
    formData.append("artist", artist);
    formData.append("artLocation", artLocation);

    if (artFiles.length === 0) {
      toast.current.show({
        severity: "error",
        summary: "上传失败",
        detail: "请上传至少一张图片",
        life: 3000,
      });
      setArtLoading(false);
      return;
    }

    if (artFiles) {
      for (let i = 0; i < artFiles.length; i++) {
        const file = artFiles[i];
        formData.append("files", file);
      }
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_Source_URL}/uploadArt`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      toast.current.show({
        severity: "success",
        summary: "上传成功",
        detail: "图片上传成功",
        life: 3000,
      });
      setArtFiles([]);
      setPlant("");
      setArtist("");
      setArtLocation("");
    } catch (error) {
      if (error.response.status === 404) {
        toast.current.show({
          severity: "error",
          summary: "上传失败",
          detail: "请选择列表中的植物",
          life: 3000,
        });
      } else {
        toast.current.show({
          severity: "error",
          summary: "上传失败",
          detail: "请重试",
          life: 3000,
        });
      }
    } finally {
      setArtLoading(false);
    }
  };

  const resetPicForm = () => {
    setPicFiles([]);
    setPicEnglishName("");
    setPicSeason("");
    setPicPhotographer("");
    setPicSetting("");
    setMonth("");
    if (fileUploadRef.current) {
      fileUploadRef.current.clear();
    }
  };

  const resetArtForm = () => {
    setArtFiles([]);
    setPlant("");
    setArtist("");
    setArtLocation("");
    if (artFileUploadRef.current) {
      artFileUploadRef.current.clear();
    }
  };

  return (
    <>
      <div className="upload">
        <Toast ref={toast} />
        <h1 className="dUpTitle">Database</h1>
        <div className="uploadContent">
          {/* Add Species Information Submission */}
          <div className="postForm">
            <h2 className="uploadTitle">Species Information Profile</h2>
            <form encType="multipart/form-data" onSubmit={handlePlantSubmit}>
              <div className="form-group">
                <div className="topInputs">
                  <InputText
                    type="text"
                    id="latinName"
                    name="latinName"
                    style={{
                      borderRadius: "0",
                      border: "2px solid #516d4e",
                    }}
                    placeholder="Latin Name"
                    value={latinName}
                    onChange={(e) => setLatinName(e.target.value)}
                    required
                  />
                  <InputText
                    type="text"
                    style={{
                      borderRadius: "0",
                      border: "2px solid #516d4e",
                    }}
                    id="chineseName"
                    name="chineseName"
                    placeholder="Chinese Name"
                    value={chineseName}
                    onChange={(e) => setChineseName(e.target.value)}
                    required
                  />
                  <InputText
                    type="text"
                    style={{
                      borderRadius: "0",
                      border: "2px solid #516d4e",
                    }}
                    id="commonName"
                    name="commonName"
                    placeholder="Common Name"
                    value={commonName}
                    onChange={(e) => setCommonName(e.target.value)}
                    required
                  />
                  <InputText
                    type="text"
                    style={{
                      borderRadius: "0",
                      border: "2px solid #516d4e",
                    }}
                    id="otherNames"
                    name="otherNames"
                    placeholder="Common Names (Optional)"
                    value={otherNames}
                    onChange={(e) => setOtherNames(e.target.value)}
                  />
                  <InputText
                    type="text"
                    id="location"
                    name="location"
                    placeholder="location (Optional)"
                    style={{
                      borderRadius: "0",
                      border: "2px solid #516d4e",
                    }}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <br />
                <InputTextarea
                  id="bloomingSeason"
                  name="bloomingSeason"
                  rows={7}
                  placeholder="Additional Information (Optional): &#13;&#13;Ex.&#13;Blooming Season 花期:&#13;Fruiting Season 果期:&#13;Interesting Facts 有趣的发现:"
                  className="inputBox additionalInfo"
                  style={{
                    borderRadius: "0",
                    resize: "none",
                    fontWeight: "100",
                    overflowY: "auto",
                  }}
                  value={bloomingSeason}
                  onChange={(e) => setBloomingSeason(e.target.value)}
                />
                <br />
                <br />

                <InputText
                  type="text"
                  id="links"
                  name="links"
                  placeholder="百科网站与链接（English）, 格式为 Website name: websitename.com"
                  className="iPTLinks"
                  style={{
                    borderRadius: "0",
                    border: "2px solid #516d4e",
                  }}
                  value={links}
                  onChange={(e) => setLinks(e.target.value)}
                />
                <br />
                <br />
                <InputText
                  type="text"
                  id="chineseLinks"
                  name="chineseLinks"
                  placeholder="百科网站与链接（中文）, 格式为 网站名: 网站名.com"
                  className="iPTLinks"
                  style={{
                    borderRadius: "0",
                    border: "2px solid #516d4e",
                  }}
                  value={chineseLinks}
                  onChange={(e) => setChineseLinks(e.target.value)}
                />
                <br />
                <br />
                <InputText
                  type="text"
                  id="editor"
                  name="editor"
                  placeholder="Editor: Name Grade"
                  className="editor"
                  style={{
                    borderRadius: "0",
                    border: "2px solid #516d4e",
                  }}
                  value={editor}
                  onChange={(e) => setEditor(e.target.value)}
                />
                <br />
              </div>
              <Button
                type="submit"
                label="Submit"
                icon="pi pi-check"
                className="formSubmit"
                style={{ borderRadius: "0" }}
                loading={plantLoading}
              />
            </form>
          </div>
          <br />

          {/* Picture Submission */}
          <div
            className="pictureForm"
            onDragEnter={(e) => e.preventDefault()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              setPicFiles(e.dataTransfer.files);
            }}
          >
            <form encType="multipart/form-data" onSubmit={handlePicSubmit}>
              <h2 className="uploadTitle">Picture upload</h2>
              <div className="picTop">
                <Dropdown
                  style={{
                    borderRadius: "0",
                    border: "2px solid #516d4e",
                  }}
                  value={picEnglishName}
                  className="picEnglishDropdown"
                  onChange={(e) => setPicEnglishName(e.value)}
                  options={namesArray}
                  optionLabel="value"
                  placeholder="Species Name (Latin) Type to search"
                  filter
                  valueTemplate={selectedPicEnglishNameTemplate}
                  itemTemplate={picEnglishNameOptionTemplate}
                  required
                />
              </div>
              <h3 className="picTitle">Timeline</h3>
              <div className="picMid">
                <Dropdown
                  value={picSeason}
                  onChange={(e) => setPicSeason(e.value)}
                  options={seasons}
                  optionLabel="value"
                  placeholder="Select a season"
                  style={{
                    borderRadius: "0",
                    border: "2px solid #516d4e",
                  }}
                />
                <Calendar
                  style={{
                    borderRadius: "0",
                    border: "2px solid #516d4e",
                  }}
                  value={month}
                  onChange={(e) => setMonth(e.value)}
                  required
                  placeholder="Select the time"
                />
                <InputText
                  type="text"
                  id="picPhotographer"
                  name="picPhotographer"
                  placeholder="Photographer"
                  style={{
                    borderRadius: "0",
                    border: "2px solid #516d4e",
                  }}
                  value={picPhotographer}
                  onChange={(e) => setPicPhotographer(e.target.value)}
                  required
                />
              </div>
              <br />
              <FileUpload
                name="fileUpload"
                ref={fileUploadRef}
                multiple
                accept="image/*"
                emptyTemplate={
                  <p className="m-0">Drag and drop files to here to upload.</p>
                }
                customUpload
                uploadHandler={handlePicFileChange}
                chooseLabel="Click to upload file(s)"
                className="fileUploadComponent"
                uploadLabel="Confirm"
              />
              <br />
              <div className="picBtm">
                <InputText
                  type="text"
                  id="picSetting"
                  name="picSetting"
                  placeholder="Setting"
                  style={{
                    borderRadius: "0",
                    border: "2px solid #516d4e",
                  }}
                  value={picSetting}
                  onChange={(e) => setPicSetting(e.target.value)}
                  required
                />
                <Button
                  icon="pi pi-refresh"
                  label="Reset"
                  className="resetButton"
                  onClick={() => resetPicForm()}
                />
              </div>
              <Button
                type="submit"
                label="Submit"
                icon="pi pi-check"
                className="formSubmit"
                style={{ borderRadius: "0" }}
                loading={picLoading}
              />
            </form>
          </div>
          <br />

          {/* Artwork Submission */}
          <div
            className="artForm"
            onDragEnter={(e) => e.preventDefault()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              setArtFiles(e.dataTransfer.files);
            }}
          >
            <form encType="multipart/form-data" onSubmit={handleArtSubmit}>
              <h2 className="uploadTitle">Artwork</h2>
              <div className="artTop">
                <Dropdown
                  style={{
                    borderRadius: "0",
                    border: "2px solid #516d4e",
                  }}
                  value={plant}
                  className="picEnglishDropdown"
                  onChange={(e) => setPlant(e.value)}
                  options={namesArray}
                  optionLabel="value"
                  placeholder="Species Name (Latin) Type to search"
                  filter
                  valueTemplate={selectedPicEnglishNameTemplate}
                  itemTemplate={picEnglishNameOptionTemplate}
                  required
                />

                <InputText
                  type="text"
                  id="artist"
                  name="artist"
                  placeholder="Creator: Name(s) Grade"
                  className="inputBox"
                  style={{
                    borderRadius: "0",
                    border: "2px solid #516d4e",
                  }}
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  required
                />
              </div>
              <br />
              <FileUpload
                name="artFileUpload"
                ref={artFileUploadRef}
                multiple
                accept="image/*"
                emptyTemplate={
                  <p className="m-0">Drag and drop files to here to upload.</p>
                }
                customUpload
                uploadHandler={handleArtFileChange}
                chooseLabel="Click to upload file(s)"
                className="fileUploadComponent"
                uploadLabel="Confirm"
              />
              <br />
              <div style={{ display: "flex", gap: "2rem" }}>
                <InputText
                  type="text"
                  id="artLocation"
                  name="location"
                  placeholder="Location"
                  className="artLocation"
                  style={{
                    borderRadius: "0",
                    border: "2px solid #516d4e",
                  }}
                  value={artLocation}
                  onChange={(e) => setArtLocation(e.target.value)}
                  required
                />
                <Button
                  icon="pi pi-refresh"
                  label="Reset"
                  className="resetButton"
                  onClick={() => resetArtForm()}
                />
              </div>
              <br />
              <Button
                type="submit"
                label="Submit"
                icon="pi pi-check"
                className="formSubmit"
                style={{ borderRadius: "0" }}
                loading={artLoading}
              />
            </form>
          </div>
        </div>
        <br />
        <br />
      </div>
    </>
  );
};

export default UploadPlants;
