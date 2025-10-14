import React, { useEffect,useState } from "react";
import "../styles/creationVideos.css";
import '../styles/videoModal.css';
import { Link, redirect, useLocation,useNavigate } from "react-router-dom";
import ReactPlayer from 'react-player'






const CreationDocumentary = (selectedSV) => {

  const seasonVideoBgMapping = {
    "2024sp":"",
    "2024su":"",
    "2024au":"",
    "2024win":"",

    "2025sp":"",
    "2025su":"",
    "2025au":"",
    "2025win":"",

    "2026sp":"",
    "2026su":"",
    "2026au":"",
    "2026win":""
  };

  const location = useLocation();

  const navigate = useNavigate();

  const [displayVid, setDisplayVid] = useState(false);

  function VideoModal(vidKey) {
    // const { vidKey } = useParams(); // Gets the video ID from the URL (e.g., 'dQw4w9WgXcQ')
    // const navigate = useNavigate();
    
    const keyVideoBgMapping = {
      "2024sp":"",
      "2024su":"",
      "2024au":"",
      "2024win":"",

      "2025sp":"",
      "2025su":"",
      "2025au":"",
      "2025win":"",

      "2026sp":"",
      "2026su":"",
      "2026au":"",
      "2026win":"",
      "handroanthus-chrysanthus":"https://www.youtube.com/watch?v=ottGhOippQc",
      "senna-surattensis":"https://youtu.be/n6znxjVFRXg",
      "lagerstromia-speciosa":"https://youtu.be/WcpFuDbjQRo",
    };

    const url = `https://youtu.be/${vidKey}`

    return (
      // The overlay div, which closes the modal when clicked
      <div className="modal-overlay" onClick={handleClose}>
        {/* The modal content, stopping click propagation to prevent closing */}
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          
          <ReactPlayer className='react-player' src={url} width="75rem" height="40rem"/>
          <button className="close-button" onClick={()=>setDisplayVid(false)}>Back</button>
        </div>
      </div>
    );
  }

  const [displayedKey, setDisplayedKey] = useState("ottGhOippQc");

  function handleClose(){
    setDisplayVid(false);
  }

  const speciesVideoIds = {
    "Candroanthus Chrysanthus":"ottGhOippQc",
    "Senna Surattensis":"n6znxjVFRXg",
    "Lagerstromia Speciosa":"WcpFuDbjQRo",
    // "Lagerstromia Specio":"WcpFuDbjQRo",
  }

  function organizeVideoIds(data,groupSize=3){
    const items = Object.entries(data);
    const groupedList = []
    for (let i = 0; i < items.length; i += groupSize) {
      const chunk = items.slice(i, i + groupSize);
      groupedList.push(Object.fromEntries(chunk));
    }
    return groupedList;
  }

  const speciesVideoMapping = organizeVideoIds(speciesVideoIds,3);

  
  return (
    <div>
      <div className="seasons">
        <div className="seasonTitle">
          Seasons
        </div>
        <img
          src={`http://img.youtube.com/vi/ottGhOippQc/0.jpg`}
          alt="pic"
          className="videoBg"
          onClick={()=>{
            navigate(`/video/ottGhOippQc`);
          }}
        />
        

        <div className="floatingSeasonGuides">
          <div className="floatingSeasonGuide1">
            <div className="seasonNum"> 2024 </div>
            
            <br/>
            <Link className="seasonLink">Spring</Link>
            <br/>
            <Link className="seasonLink">Summer</Link>
            <br/>
            <Link className="seasonLink" >Autumn</Link>
            <br/>
            <Link className="seasonLink">Winter</Link>

          </div>

          <div className="floatingSeasonGuide2">
            <div className="seasonNum"> 2025 </div>
            <br></br>
            <Link className="seasonLink">Spring</Link>
            <br/>
            <Link className="seasonLink">Summer</Link>
            <br/>
            <Link className="seasonLink">Autumn</Link>
            <br/>
            <Link className="seasonLink">Winter</Link>
          </div>

          <div className="floatingSeasonGuide3">
            <div className="seasonNum"> 2026 </div>
            <br></br>
            <Link className="seasonLink">Spring</Link>
          </div>
        </div>
        
      </div>
      <div className="species">
        <div className="speciesTitle">
          Meet the Species
        </div>
        <div className="thumnailContainer">
          {speciesVideoMapping.map((element, rowIndex) => {
            
              const url1 = `http://img.youtube.com/vi/${Object.values(element)[0]}/0.jpg`;
              const url2 = Object.values(element)[1] && `http://img.youtube.com/vi/${Object.values(element)[1]}/0.jpg`;
              const url3 = Object.values(element)[2] && `http://img.youtube.com/vi/${Object.values(element)[2]}/0.jpg`;

              return <div className="tbBox" key={rowIndex}>

                <div className="vidBox1">
                  <img
                    src={url1}
                    alt="pic"
                    className="youtb1"
                    onClick={()=>{
                      navigate(`/video/${Object.values(element)[0]}`);
                    }}
                  />
                  <text className="vidCaption">
                    {Object.keys(element)[0]}
                  </text>
                </div>
                
                {url2 && 
                <div className="vidBox1">
                  <img
                    src={url2}
                    alt="pic"
                    className="youtb2"
                    onClick={()=>{
                      navigate(`/video/${Object.values(element)[1]}`);
                    }}
                  />
                  <text className="vidCaption">
                    {Object.keys(element)[1]}
                  </text>
                </div>
                }



                {url3 && 
                <div className="vidBox1">
                  <img
                    src={url3}
                    alt="pic"
                    className="youtb3"
                    onClick={()=>{
                      navigate(`/video/${Object.values(element)[2]}`);
                    }}
                  />
                  <text className="vidCaption">
                    {Object.keys(element)[2]}
                  </text>
                </div>
                }
              </div>
            })
          }
        </div>

      </div>

      {/* {displayVid && VideoModal(displayedKey)} */}
    </div>
  );
};

export default CreationDocumentary;
