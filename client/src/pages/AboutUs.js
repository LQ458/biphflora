import React, { useState, useEffect } from "react";
import "../styles/upload.css";
import Navbar from "../components/Navbar.js";

const AboutUs = () => {
  const [loading, setLoading] = useState(true);
  const [aboutUs, setAboutUs] = useState("-About Us-");
  const [curLang, setCurLang] = useState("en");

  const floraClubInfoChin = `
          首先，我们先介绍一下Flora Club识草木社团。本社团成立于2023年9月，社团的主要工作包括物种识别、创建校园植物与鸟类信息档案，创作绘画作品、策划自然书展与摄影绘画作品展览、组织校园植物导赏、录制关于校园物种的介绍视频，以及制作季节纪录片。

        识别校园植物和录入相关的百科知识是创建校园植物信息档案的基础，也是Flora Club识草木社团的一项基础工作。识别植物指的是辨别植物的种和属以及明确它们的拉丁名，在此基础上，通过搜索和筛选专业网站，搜索该植物的资料，包括其特征，拉丁词源，与其他生物的互作，历史来源和药用价值等等。然后选取部分网站上的信息，并结合自己的观察，作为植物的介绍信息。当然，也会提供所参考的网站链接，方便其他学生使用这些线上资源更进一步的探索此植物的相关信息。同时，社员们将使用不同焦距的镜头，拍摄和录制每一种植物的叶、花、果、茎等部位在四季变迁中的不同状态，记录栖息在这些植物上的昆虫和鸟类。这些共同构成了校园植物信息档案的内容。此外，在与观鸟爱好者的合作下，我们将增添校内鸟类物种的信息档案，介绍其栖息的植物，与推荐观察的地点。

        通过创作以校园植物、昆虫和鸟类为素材的绘画作品，社员们用水彩、彩铅、线上绘画等不同形式展现他们在不同视角下对动植物的观察、理解和热爱。

        Flora Club识草木社团将积累上述工作的成果，并从过往的摄影和绘画作品中精心挑选出最优秀的那部分，在图书馆进行展出。以这些作品为载体，我们希望能够向同学们打开一扇通往缤纷生命的窗户。本社团也会在图书馆举办以大自然为主题的书展，鼓励同学们在阅读中走进自然。

        植物导赏是Flora Club识草木社团所有成员参与的最为重要的工作之一。本社团计划在校园内设置3条时长为半小时至一小时的植物观赏线路，社员将带领大家行走在校园内，领略校园的植物风光，并沿路向大家介绍身边植物的百科知识以及它们的有趣故事。我们将会为幼儿园和小学学生单独设计植物观赏的活动，并且会在之后开放给所有学生和老师参与，我们将在网站的主页上公布植物导赏的预约信息。

        制作关于校园植物和生物多样性的纪录片是Flora Club识草木社团所有成员参与的最为重要的另一项工作。根据影像资料与整理的信息档案，成员们使用视频编辑和录音去制作介绍单个物种的短视频与以不同季节为主题的专题纪录片。
`;
  const floraWebInfoChin = `       其次，我们想介绍一下BIPH Flora网站。BIPH Flora网站创建于2023年10月，由Leo Qin、Jess Chen和 Zoe He共同开发。 创建与经营BIPH Flora 网站是Flora Club识草木社团的另一项基础工作。

       BIPH FLORA设有“主页”、“校内植物检索数据库”、和“创作”板块，其中“创作”板块包含“绘画”、“视频与纪录片”等次板块，社员们在工作中所获取的成果将全部放入到这些板块中，因此，BIPH FLORA网站将成为本社团向老师和同学们展现校园生物多样性的一个网络平台。


`;

  const floraClubInfoEng = `
Flora Club was founded in September 2023. The club’s main activities include species identification, compiling information profiles for campus plants and birds, creating artworks, organizing book fairs and exhibitions of photographs and artworks, designing botany guided tours, and producing videos and seasonal documentaries introducing campus species.

Species Identification and Information Profiles: Species identification involves determining the genus and species of plants and recording their Latin names. Members search for information about each plant on reliable websites, covering aspects such as its characteristics, etymology, interactions with other organisms, historical background, and medicinal value. They then select relevant details from these sources and combine them with their own observations to create plant introductions. Additionally, they provide links to the referenced websites, allowing other students to further explore the plant using these sources. Meanwhile, members document different parts of each plant—foliage, flowers, fruits, and stems—throughout the seasons using various camera lenses. They also record insects and birds that interact with these plants. All this information is compiled into plant profiles featured in the website’s database. In collaboration with campus birdwatching enthusiasts, the club will expand the database to include bird species, detailing their preferred plant habitats and recommended observation spots.

Artworks: Club members create artwork inspired by campus plants, insects, and birds, using techniques such as watercolor, colored pencils, and digital painting. Through their work, they express their observations, understanding, and appreciation of nature.

Themed Book Fairs and Exhibitions of Photographs and Paintings: The club will regularly showcase photographs and artworks in the library, offering students a window into the diversity of life on campus. Additionally, the club will organize nature-themed book fairs in the library, encouraging students to connect with nature through reading.

Botany Guided Tours: The club plans to design three guided tour routes across campus, each lasting 30 minutes to an hour. Club members will lead participants along these routes, introducing the unique characteristics of plants and sharing fascinating stories about them. Tour registration will be available on the homepage of the website.

Videos Introducing Plant Species and Seasonal Documentaries: Members write scripts based on plant information profiles, then record and edit videos to introduce various species on campus. These videos will serve as valuable educational resources for pre-K and primary school students. Additionally, members produce documentaries focused on specific seasons and broader ecological themes.
  `;
  const floraWebInfoEng = `
  The BIPH Flora website was launched in October 2023 and co-created by Leo Qin, Jess Chen, and Zoe He. Managing and maintaining this website is a key responsibility of the Flora Club. The website features three main sections: "Home," "Database of Plant Species on Campus," and "Creations." The "Creations" section is further divided into "Artwork," "Videos & Documentaries," and other subsections. All work produced by club members will be uploaded to these sections, making BIPH Flora an online platform that showcases the campus’s biodiversity to both students and faculty.


  `;

  const [aboutFloraClub, setAboutFloraClub] = useState(floraClubInfoEng);
  const [aboutFloraWeb, setAboutFloraWeb] = useState(floraWebInfoEng);
  const [advisor, setAdvisor] = useState("Club Advisor:");
  const [contact, setContact] = useState("Email:");
  const [techSupport, setTechSupport] = useState("Tech Support:");
  const [founder, setFounder] = useState("Club Leader:");
  const [additional, setAdditional] = useState(
    "(For collaboration and work submissions, feel free to contact me via Teams or email.)"
  );

  useEffect(() => {
    const handleLoad = () => {
      setLoading(false);
    };

    handleLoad();
  }, []);

  const handleLangChange = (lang) => {
    setCurLang(lang);
    setAboutFloraClub(lang === "cn" ? floraClubInfoChin : floraClubInfoEng);
    setAboutFloraWeb(lang === "cn" ? floraWebInfoChin : floraWebInfoEng);
    setAdvisor(lang === "cn" ? "指导老师：" : "Club Advisor:");
    setContact(lang === "cn" ? "联系方式：" : "Email:");
    setTechSupport(lang === "cn" ? "技术支持：" : "Tech Support:");
    setFounder(lang === "cn" ? "BIPH FLORA 社团创始人：" : "Club Leader:");
    setAdditional(
      lang === "cn"
        ? "(联动及投稿相关可以直接通过teams或邮箱联系)"
        : "(For collaboration and work submissions, feel free to contact me via Teams or email.)"
    );
    setAboutUs(lang === "cn" ? "-关于我们-" : "-About Us-");
  };

  return (
    <section className="aboutUs">
      <Navbar className="aboutUsNavbar" />

      {loading && (
        <section className="loadingCreation">
          <div className="part1"></div>
          <div className="dots-container">
            <div className="dots"></div>
            <div className="dots"></div>
            <div className="dots"></div>
            <div className="dots"></div>
            <div className="dots"></div>
          </div>
        </section>
      )}
      <div
        className="aboutUsContent"
        style={{
          height: curLang === "cn" ? "" : "135vw",
        }}
      >
        <h1 className="aboutUsTitle">{aboutUs}</h1>
        <div className="aboutUsLang">
          <button
            className="aboutUsLangButton"
            style={{ textDecoration: curLang === "cn" ? "underline" : "none" }}
            onClick={() => handleLangChange("cn")}
          >
            中
          </button>
          <p
            style={{ color: "#2d4228", fontSize: "1.2rem", fontWeight: "bold" }}
          >
            /
          </p>
          <button
            className="aboutUsLangButton"
            style={{ textDecoration: curLang === "en" ? "underline" : "none" }}
            onClick={() => handleLangChange("en")}
          >
            En
          </button>
        </div>
        <div className="aboutClubBox" style={{height:curLang === "en" ? "48.09vw" : "41.5vw"}}>
          <h2 className="clubLabel">I. Flora Club</h2>
          <p
            className="clubContent"
            style={{ fontSize: curLang === "cn" ? "" : "18px" }}
          >
            {aboutFloraClub}
          </p>
          <img
            src={`${process.env.REACT_APP_Source_URL}/public/1.jpg`}
            alt="pic of bird"
            className="birdPic"
          />
          <div className="greenBox" />
        </div>

        <div
          className="aboutWebBox"
          style={{ top: curLang === "cn" ? "12vw" : "15vw" }}
        >
          <h2 className="webLabel">II. BIPH FLORA Website</h2>
          <p className="webContent" style = {{top: curLang==="cn"?"6.44vw":"5.04vw"}}>{aboutFloraWeb}</p>
          <img
            src={`${process.env.REACT_APP_Source_URL}/public/favicon.ico`}
            alt="flowerIcon"
            className="flowerIcon"
          />
          <div className="flowerMiddleText">
            Logo designed by Yvonne Wang
          </div>
          <img
            src={`${process.env.REACT_APP_Source_URL}/public/6.jpg`}
            alt="bottomB"
            className="flowerBottom"
          />
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <p className="subLabel1">
                {curLang === "cn"
                  ? "BIPH FLORA网站创建成员"
                  : "Website Development Team"}
              </p>
              <p
                className="subSubLabel1"
                style={{ left: curLang === "cn" ? "2rem" : "2rem" }}
              >
                Leo Qin{" "}
                {curLang === "cn"
                  ? "（负责网站的编程工作）"
                  : "(Web Developer)"}
                <br />
                Jess Chen{" "}
                {curLang === "cn"
                  ? "（负责网站的编程工作）"
                  : "(Web Developer)"}
                <br />
                Zoe He{" "}
                {curLang === "cn" ? "（负责网站的设计工作）" : "(Web Designer)"}
              </p>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <p className="subLabel2">
                {curLang === "cn" ? "绘画小组成员" : "Artwork Team"}
              </p>
              <p
                className="subSubLabel2"
                style={{ left: curLang === "cn" ? "" : "21.5vw" }}
              >
                Rachel Zhang
                <br />
                Sophia Zhou
                <br />
                Kaitlyn Xu
                <br />
                Tyler Lin
                <br />
                Michelle Feng
                <br />
                Yvonne Wang
                <br />
                Phyllis Li
                <br />
                Vivienne Su
              </p>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <p className="subLabel3">
                {curLang === "cn"
                  ? "植物信息档案创建及管理小组成员"
                  : "Species Profile Upload & Management Team"}
              </p>
              <p
                className="subSubLabel3"
                style={{ left: curLang === "cn" ? "" : "38.5vw" }}
              >
                Rachel Zhang
                <br />
                Kaitlyn Xu
                <br />
                Jarita Wen
                <br />
                Genevieve Li
                <br />
                Henry Zhu
                <br />
                Zoe He
                <br />
                Helen Nie
                <br />
                Jenny Nie
              </p>
            </div>
          </div>
        </div>

        <div
          className="contactUs"
          style={{ top: curLang === "cn" ? "" : "12vw" }}
        >
          {/* <div style={{top:"12vw"}}>
                123
          </div> */}
          <h2 className="contactUsTitle">III. Contact Us</h2>
          <img
            src={`${process.env.REACT_APP_Source_URL}/public/2.jpg`}
            alt="flower"
            className="whiteFlower"
          />
          <div className="greenBox2" />
          <p className="contactLabel1">
            {advisor} <br /> Doris Sander
          </p>
          <p
            className="contactInfo1"
            style={{ left: curLang === "cn" ? "" : "59vw" }}
          >
            {contact}doris.sander-biph@basischina.com
          </p>
          <p className="contactLabel2">
            {techSupport}
            <br /> Leo Qin <br /> Jess Chen{" "}
          </p>
          <p
            className="contactInfo2"
            style={{ left: curLang === "cn" ? "" : "59vw" }}
          >
            {contact}yihao.qin17311-biph@basischina.com <br />
            {contact}kashun.chen15091-biph@basischina.com
          </p>
          <p className="contactLabel3">
            {founder}
            <br />
            Zoe He
          </p>
          <p
            className="contactInfo3"
            style={{ left: curLang === "cn" ? "" : "49vw" }}
          >
            {contact}zoe.he41172-biph@basischina.com
            <br />
            {additional}
          </p>
          <br/>
          <br/>
          <img
            src={`${process.env.REACT_APP_Source_URL}/public/${curLang === "cn" ? "9.PNG" : "9-en.png"}`}
            className="cssHell"
            style={{
              scale: curLang === "cn" ? "1" : "0.65",
              left: curLang === "cn" ? "" : "30vw",
              top: curLang === "cn" ? "19vw" : "19vw",
              width: curLang === "cn" ? "" : "65vw",
            }}
            alt="additional"
          />
          
        </div>

      </div>
      
      <div className="bottomBart" />
      <div className="bottomBar" />
    </section>
  );
};

export default AboutUs;
