import axios from "axios";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import { FileUpload } from "primereact/fileupload";
import { Toast } from "primereact/toast";
import "../styles/uploadBirds.css";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import imageCompression from "browser-image-compression";

const UploadBirds = () => {
  const [latinName, setLatinName] = useState("");
  const [chineseName, setChineseName] = useState("");
  const [commonName, setCommonName] = useState("");
  const [location, setLocation] = useState("");

  
  const [appearance, setAppearance] = useState("");
  const [songs, setSongs] = useState("");
  const [diet, setDiet] = useState("");
  const [habitat, setHabitat] = useState("");
  const [migration, setMigration] = useState("");
  const [breeding, setBreeding] = useState("");
  const [juvChar, setJuvChar] = useState("");
  const [subChar, setSubChar] = useState("");
  const [madultChar, setMadultChar] = useState("");
  const [fadultChar, setFadultChar] = useState("");

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
  const [linkTitles, setLinkTitles] = useState([]);
  const [linkUrls, setLinkUrls] = useState([]);
  const [chineseLinkTitles, setChineseLinkTitles] = useState([]);
  const [chineseLinkUrls, setChineseLinkUrls] = useState([]);
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
          `${process.env.REACT_APP_Source_URL}/searchBirdNames`,
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
    { value: "Juvenile" },
    { value: "Sub-adult" },
    { value: "Male Adult" },
    { value: "Female Adult" },
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
      const link = linkParts.slice(1).join(":").trim(); // Rejoin the remaining parts into the link and trim whitespace

      // 确保链接包含协议前缀
      let formattedLink = link;
      if (link && !link.startsWith("http://") && !link.startsWith("https://")) {
        formattedLink = "https://" + link;
      }

      linkArray.push({
        linkTitle: linkTitle,
        link: formattedLink,
      });
    });
    setLinkTitles(linkArray.map((item) => item.linkTitle));
    setLinkUrls(linkArray.map((item) => item.link));
  }, [links]);

  useEffect(() => {
    const splittedLinks = chineseLinks.split(", ");
    var linkArray = [];
    splittedLinks.forEach((splittedLink) => {
      const linkParts = splittedLink.split(":");
      const linkTitle = linkParts[0];
      const link = linkParts.slice(1).join(":").trim(); // Rejoin the remaining parts into the link and trim whitespace

      // 确保链接包含协议前缀
      let formattedLink = link;
      if (link && !link.startsWith("http://") && !link.startsWith("https://")) {
        formattedLink = "https://" + link;
      }

      linkArray.push({
        linkTitle: linkTitle,
        link: formattedLink,
      });
    });
    setChineseLinkTitles(linkArray.map((item) => item.linkTitle));
    setChineseLinkUrls(linkArray.map((item) => item.link));
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

    // 在提交前更新链接
    addEnglishLink();
    addChineseLink();

    // 处理链接数据
    const processedLinkArray = linkTitles.map((title, idx) => {
      let url = linkUrls[idx] || "";
      // 确保链接包含协议前缀
      if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
      }
      return {
        linkTitle: title,
        link: url,
      };
    });

    const processedChineseLinkArray = chineseLinkTitles.map((title, idx) => {
      let url = chineseLinkUrls[idx] || "";
      // 确保链接包含协议前缀
      if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
      }
      return {
        linkTitle: title,
        link: url,
      };
    });

    const formData = new FormData();
    formData.append("latinName", latinName);
    formData.append("chineseName", chineseName);
    formData.append("commonName", commonName);

    formData.append("habitat", habitat);
    formData.append("appearance", appearance);
    formData.append("diet", diet);
    formData.append("songs", songs);
    formData.append("migration", migration);
    formData.append("breeding", breeding);

    formData.append("editor", editor);
    formData.append("link", JSON.stringify(processedLinkArray));
    formData.append("chineseLink", JSON.stringify(processedChineseLinkArray));
    formData.append("otherNames", otherNames);
    formData.append("juvChar", juvChar);
    formData.append("subChar", subChar);
    formData.append("mAdultChar", madultChar);
    formData.append("fAdultChar", fadultChar);

    try {
      await axios.post(`${process.env.REACT_APP_Source_URL}/uploadBird`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.current.show({
        severity: "success",
        summary: "创建成功",
        detail: "鸟类创建成功",
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

      setDiet("");
      setHabitat("");
      setSongs("");
      setMigration("");
      setAppearance("");
      setBreeding("");

      // 重置链接数组
      setLinkTitles([]);
      setLinkUrls([]);
      setChineseLinkTitles([]);
      setChineseLinkUrls([]);
    } catch (error) {
      if (error.response.status === 400) {
        toast.current.show({
          severity: "error",
          summary: "上传失败",
          detail: "鸟类已存在",
          life: 3000,
        });
      }
      setPlantLoading(false);
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
        maxWidthOrHeight: 1600,
        useWebWorker: true,
        initialQuality: 1,
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
        `${process.env.REACT_APP_Source_URL}/uploadBirdPic`,
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
          detail: "请选择列表中的鸟类",
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

  // 添加链接处理函数
  const addEnglishLink = () => {
    if (!linkTitles.length) return;

    // 创建链接字符串并更新到links
    const newLinks = linkTitles
      .map((title, idx) => {
        const url = linkUrls[idx] || "";
        return `${title}: ${url}`;
      })
      .join(", ");

    setLinks(newLinks);
  };

  const addChineseLink = () => {
    if (!chineseLinkTitles.length) return;

    // 创建链接字符串并更新到chineseLinks
    const newLinks = chineseLinkTitles
      .map((title, idx) => {
        const url = chineseLinkUrls[idx] || "";
        return `${title}: ${url}`;
      })
      .join(", ");

    setChineseLinks(newLinks);
  };

  // 添加英文链接标题和URL
  const addEnglishLinkField = () => {
    setLinkTitles([...linkTitles, ""]);
    setLinkUrls([...linkUrls, ""]);
  };

  // 添加中文链接标题和URL
  const addChineseLinkField = () => {
    setChineseLinkTitles([...chineseLinkTitles, ""]);
    setChineseLinkUrls([...chineseLinkUrls, ""]);
  };

  // 更新英文链接标题
  const updateEnglishLinkTitle = (index, value) => {
    const newTitles = [...linkTitles];
    newTitles[index] = value;
    setLinkTitles(newTitles);
  };

  // 更新英文链接URL
  const updateEnglishLinkUrl = (index, value) => {
    const newUrls = [...linkUrls];
    newUrls[index] = value;
    setLinkUrls(newUrls);
  };

  // 更新中文链接标题
  const updateChineseLinkTitle = (index, value) => {
    const newTitles = [...chineseLinkTitles];
    newTitles[index] = value;
    setChineseLinkTitles(newTitles);
  };

  // 更新中文链接URL
  const updateChineseLinkUrl = (index, value) => {
    const newUrls = [...chineseLinkUrls];
    newUrls[index] = value;
    setChineseLinkUrls(newUrls);
  };

  // 删除英文链接
  const removeEnglishLink = (index) => {
    setLinkTitles(linkTitles.filter((_, idx) => idx !== index));
    setLinkUrls(linkUrls.filter((_, idx) => idx !== index));
  };

  // 删除中文链接
  const removeChineseLink = (index) => {
    setChineseLinkTitles(chineseLinkTitles.filter((_, idx) => idx !== index));
    setChineseLinkUrls(chineseLinkUrls.filter((_, idx) => idx !== index));
  };

  return (
    <>
      <div className="upload">
        <Toast ref={toast} />
        <h1 className="dUpTitle">Bird Database</h1>
        <div className="uploadContent">
          {/* Add Species Information Submission */}
          <div className="postForm">
            <h2 className="uploadTitle">Bird Species Information Profile</h2>
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
                    id="habitat"
                    name="habitat"
                    placeholder="Habitat"
                    style={{
                      borderRadius: "0",
                      border: "2px solid #516d4e",
                    }}
                    value={habitat}
                    onChange={(e) => setHabitat(e.target.value)}
                  />
                </div>
                <br/>
                <div className="midInputs">
                  <InputText
                    type="text"
                    id="appearance"
                    name="appearance"
                    style={{
                      borderRadius: "0",
                      border: "2px solid #516d4e",
                    }}
                    placeholder="Appearance"
                    value={appearance}
                    onChange={(e) => setAppearance(e.target.value)}
                    required
                  />
                  <InputText
                    type="text"
                    style={{
                      borderRadius: "0",
                      border: "2px solid #516d4e",
                    }}
                    id="songs"
                    name="songs"
                    placeholder="Songs"
                    value={songs}
                    onChange={(e) => setSongs(e.target.value)}
                    required
                  />
                  <InputText
                    type="text"
                    style={{
                      borderRadius: "0",
                      border: "2px solid #516d4e",
                    }}
                    id="diet"
                    name="diet"
                    placeholder="Diet"
                    value={diet}
                    onChange={(e) => setDiet(e.target.value)}
                    required
                  />
                  <InputText
                    type="text"
                    style={{
                      borderRadius: "0",
                      border: "2px solid #516d4e",
                    }}
                    id="migration"
                    name="migration"
                    placeholder="Migration"
                    value={migration}
                    onChange={(e) => setMigration(e.target.value)}
                  />
                  
                  <InputText
                    type="text"
                    id="breeding"
                    name="breeding"
                    placeholder="Breeding"
                    style={{
                      borderRadius: "0",
                      border: "2px solid #516d4e",
                    }}
                    value={breeding}
                    onChange={(e) => setBreeding(e.target.value)}
                  />
                </div>
                <br/>
                <div className="bottomInputs">
                  <InputText
                    type="text"
                    id="juvChar"
                    name="juvChar"
                    style={{
                      borderRadius: "0",
                      border: "2px solid #516d4e",
                    }}
                    placeholder="Juvenile Characteristics"
                    value={juvChar}
                    onChange={(e) => setJuvChar(e.target.value)}
                    required
                  />
                  <InputText
                    type="text"
                    style={{
                      borderRadius: "0",
                      border: "2px solid #516d4e",
                    }}
                    id="subChar"
                    name="subChar"
                    placeholder="Sub-adult Characteristics"
                    value={subChar}
                    onChange={(e) => setSubChar(e.target.value)}
                    required
                  />
                  <InputText
                    type="text"
                    style={{
                      borderRadius: "0",
                      border: "2px solid #516d4e",
                    }}
                    id="madult"
                    name="madult"
                    placeholder="Male Adult Characteristics"
                    value={madultChar}
                    onChange={(e) => setMadultChar(e.target.value)}
                    required
                  />
                  <InputText
                    type="text"
                    style={{
                      borderRadius: "0",
                      border: "2px solid #516d4e",
                    }}
                    id="fadult"
                    name="fadult"
                    placeholder="Female Adult Characteristics"
                    value={fadultChar}
                    onChange={(e) => setFadultChar(e.target.value)}
                  />
                  
                </div>
                <br />
                <InputTextarea
                  id="bloomingSeason"
                  name="bloomingSeason"
                  rows={7}
                  placeholder="Additional Information (Optional)"
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

                <div className="linkSection">
                  <h4 style={{ color: "#516d4e" }}>
                    百科网站与链接（English）
                  </h4>
                  {linkTitles.map((title, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        marginBottom: "10px",
                        alignItems: "center",
                      }}
                    >
                      <InputText
                        type="text"
                        placeholder="Website name"
                        style={{
                          borderRadius: "0",
                          border: "2px solid #516d4e",
                          marginRight: "10px",
                          width: "30%",
                        }}
                        value={title}
                        onChange={(e) =>
                          updateEnglishLinkTitle(index, e.target.value)
                        }
                      />
                      <InputText
                        type="text"
                        placeholder="Website URL (e.g., website.com)"
                        style={{
                          borderRadius: "0",
                          border: "2px solid #516d4e",
                          width: "60%",
                        }}
                        value={linkUrls[index] || ""}
                        onChange={(e) =>
                          updateEnglishLinkUrl(index, e.target.value)
                        }
                      />
                      <Button
                        icon="pi pi-times"
                        className="p-button-rounded p-button-danger p-button-outlined"
                        style={{ marginLeft: "10px" }}
                        onClick={() => removeEnglishLink(index)}
                      />
                    </div>
                  ))}
                  <Button
                    label="添加英文链接"
                    icon="pi pi-plus"
                    style={{
                      background: "#516d4e",
                      border: "none",
                      marginTop: "10px",
                    }}
                    onClick={addEnglishLinkField}
                  />
                </div>

                <br />
                <br />

                <div className="linkSection">
                  <h4 style={{ color: "#516d4e" }}>百科网站与链接（中文）</h4>
                  {chineseLinkTitles.map((title, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        marginBottom: "10px",
                        alignItems: "center",
                      }}
                    >
                      <InputText
                        type="text"
                        placeholder="网站名"
                        style={{
                          borderRadius: "0",
                          border: "2px solid #516d4e",
                          marginRight: "10px",
                          width: "30%",
                        }}
                        value={title}
                        onChange={(e) =>
                          updateChineseLinkTitle(index, e.target.value)
                        }
                      />
                      <InputText
                        type="text"
                        placeholder="网站链接 (例如: website.com)"
                        style={{
                          borderRadius: "0",
                          border: "2px solid #516d4e",
                          width: "60%",
                        }}
                        value={chineseLinkUrls[index] || ""}
                        onChange={(e) =>
                          updateChineseLinkUrl(index, e.target.value)
                        }
                      />
                      <Button
                        icon="pi pi-times"
                        className="p-button-rounded p-button-danger p-button-outlined"
                        style={{ marginLeft: "10px" }}
                        onClick={() => removeChineseLink(index)}
                      />
                    </div>
                  ))}
                  <Button
                    label="添加中文链接"
                    icon="pi pi-plus"
                    style={{
                      background: "#516d4e",
                      border: "none",
                      marginTop: "10px",
                    }}
                    onClick={addChineseLinkField}
                  />
                </div>

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
                  placeholder="Select a life stage"
                  required
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

          {/* Artwork Submission
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
          </div> */}
        </div>
        <br />
        <br />
      </div>
    </>
  );
};

export default UploadBirds;
