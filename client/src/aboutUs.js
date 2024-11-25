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

const AboutUs = () => {
  const [loading, setLoading] = useState(true);
  const [aboutUs, setAboutUs] = useState("-关于我们-");

  const floraClubInfoChin = `
  首先，我们先介绍一下Flora Club识草木社团。本社团成立于2023年9月，社团的主要工作包括创建以识别校园植物以及录入相关的百科知识链接为基础的校园植物信息档案、创建网站、创作以校园植物、昆虫和鸟类等为素材的绘画作品和撰写相关的自然笔记，并定期在图书馆或校园的其它区域展出、在图书馆举办以大自然为主题的书展、向老师和同学们征集朗诵大自然著作的作品、组织校园植物导赏以及制作关于校园生物多样性的纪录片等。
  
  识别校园植物和录入相关的百科知识链接是创建校园植物信息档案的基础，也是Flora Club识草木社团的一项基础工作。识别植物指的是辨别植物的种和属以及明确它们的拉丁名，在此基础上，通过搜索和筛选专业网站，录入相关的百科知识链接，为同学们提供了解校园植物百科知识的平台。此外，社员们将通过不同焦距的镜头，拍摄和录制每一种植物的叶、花、果、茎等部位在四季变迁中的不同状态；记录栖息在这些植物上的昆虫和鸟类等；用录音设备捕捉大自然的声音，例如，风声、鸟声、树叶的声音等，这些共同构成了校园植物信息档案的内容。
  
  创作以校园植物、昆虫和鸟类为素材的绘画作品和撰写相关的自然笔记是社员们通过画笔和文字展现他们在不同视角下对动植物的观察、理解和热爱。绘画作品选用水彩、素描和油画等表现手法；自然笔记采用诗歌、散文或者学术论文的书写形式。
  
  Flora Club识草木社团将积累上述工作的成果，并从过往的摄影、绘画和自然笔记等作品中精心挑选出最优秀的那部分，每年在图书馆或三楼的open area进行展出。以这些作品为载体，我们希望能够向同学们打开一扇通往缤纷世界的窗户。
  
  本社团每年也会在图书馆举办以大自然为主题的书展，鼓励同学们在阅读中走进自然。
  
  我们将持续地向同学们征集以大自然为主题的名著的朗诵作品，这些著作有《物种起源》、《寂静的春天》、《瓦尔登湖》、《沙乡年鉴》、《缤纷的生命》、《给植物命名的故事》和《The Future We Choose ：Solving Climate Crisis》等，朗诵的语种既可以是英语，也可以是中文、法语、西班班牙语等。目前本社团已经和校内的西班牙语社团联动，他们将为同学们带来精彩的朗诵音频。
  
  植物导赏是Flora Club识草木社团所有成员参与的最为重要的一项工作。本社团计划在校园内设置2-3条植物观赏线路，同学们通过在 Flora网站上预约，社员将带领大家行走在校园内，领略校园的植物风光，并沿路向大家介绍身边植物的百科知识以及它们的有趣故事。我们将在网站上发布植物导赏的预约规则。
  
  制作关于校园植物和生物多样性的纪录片是Flora Club识草木社团所有成员参与的最为重要的另一项工作。我们会围绕不同的主题，从录制短视频过渡到录制专题纪录片。
  `;
  const floraWebInfoChin = `其次，我们想介绍一下BIPH Flora网站。BIPH Flora网站创建于2023年10月，由Leo Qin、Jess Chen和Zoe He共同开发。创建与经营BIPH Flora网站是Flora Club识草木社团的另一项基础工作。

  BIPH FLORA设有“关于我们”、“植物信息档案”、“创作”、“植物导赏”、“纪录片”等板块，其中“创作”板块又包含“绘画”、“自然笔记”、“校园展览”、“朗诵音频”等次板块，社员们在工作中所获取的成果将全部放入到这些板块中，因此，BIPH FLORA网站将成为本社团向老师和同学们展现校园生物多样性的一个网络平台。`;

  const [aboutFloraClub, setAboutFloraClub] = useState(floraClubInfoChin);
  const [aboutFloraWeb, setAboutFloraWeb] = useState(floraWebInfoChin);

  useEffect(() => {
    const handleLoad = () => {
      setLoading(false);
    };

    handleLoad();
  }, []);

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
      <div className="aboutUsContent">
        <h1 className="aboutUsTitle">{aboutUs}</h1>
        <div className="aboutClubBox">
          <h2 className="clubLabel">I. Flora Club</h2>
          <pre className="clubContent">{aboutFloraClub}</pre>
          <img src="/1.JPG" alt="picture of bird" className="birdPic" />
          <div className="greenBox"></div>
        </div>

        <div className="aboutWebBox">
          <h2 className="webLabel">II. BIPH FLORA Website</h2>
          <pre className="webContent">{aboutFloraWeb}</pre>
          <img src="/favicon.ico" alt="flowerIcon" className="flowerIcon" />
          <img src="/6.JPG" alt="bottomB" className="flowerBottom" />
          <p className="subLabel1">BIPH FLORA网站创建成员：</p>
          <p className="subSubLabel1">
            Leo Qin （负责网站的编程工作）
            <br />
            Jess Chen（负责网站的编程工作）
            <br />
            Zoe He （负责网站的设计工作）
          </p>
          <p className="subLabel2">绘画小组成员:</p>
          <p className="subSubLabel2">
            Rachel Zhang <br />
            Sophia Zhang <br />
            Kaitlyn <br />
            Tyler <br />
            Michelle Feng <br />
            Yvonne Wang <br />
          </p>
          <p className="subLabel3">
            绘画小组植物数据库信息档案创建及管理小组成员:
          </p>
          <p className="subSubLabel3">
            Kaitlyn <br />
            Rachel
            <br />
            Zoe He <br />
          </p>
          <p className="subLabel4">社员作品刊登期刊方：</p>
          <p className="subSubLabel4">《山海》， 《行者人文》</p>
          <p className="caption">Logo designed by Yvonne Wang</p>
        </div>

        <div className="contactUs">
          <h2 className="contactUsTitle">III. Contact Us</h2>
          <img src="/2.JPG" alt="flower" className="whiteFlower" />
          <div className="greenBox2" />
          <p className="contactLabel1">
            指导老师： <br /> Doris Sander
          </p>
          <p className="contactInfo1">
            联系方式：doris.sander-biph@basischina.com
          </p>
          <p className="contactLabel2">
            技术支持：
            <br /> Leo Qin <br /> Jess Chen{" "}
          </p>
          <p className="contactInfo2">
            联系方式：yihao.qin17311-biph@basischina.com <br />
            联系方式：kashun.chen15091-biph@basischina.com
          </p>
          <p className="contactLabel3">
            社团创始人：
            <br />
            Zoe He
          </p>
          <p className="contactInfo3">
            联系方式：zoe.he41172-biph@basischina.com
            <br />
            (联动及投稿相关可以直接通过teams或邮箱联系)
          </p>
          <img src="/9.PNG" className="cssHell" />
        </div>
      </div>
      <div className="bottomBart" />
      <div className="bottomBar" />
    </section>
  );
};

export default AboutUs;
