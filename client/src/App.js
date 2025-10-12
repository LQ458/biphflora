import "./App.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Glossary from "./pages/Glossary";
import BirdGlossary from "./pages/BirdGlossary";
import Home from "./pages/Home";
import Database from "./pages/Database";
import BirdDatabase from "./pages/BirdDatabase";
import Upload from "./pages/Upload";
import Creation from "./pages/Creation";
import AboutUs from "./pages/AboutUs";
import Activities from "./pages/Activities";
import AdminView from "./components/AdminView";
import EditPage from "./pages/EditPage";
import AdminAuth from "./components/AdminAuth";
import BirdEditPage from "./pages/BirdEditPage";
import NotFound from "./pages/NotFound";
import { UserProvider } from "./UserContext";
import { PrimeReactProvider } from "primereact/api";
import "primereact/resources/themes/saga-green/theme.css";
import "primeicons/primeicons.css";
import "primereact/resources/primereact.min.css"; // 核心样式                           // 图标
import "primeflex/primeflex.css"; // 布局

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import React, { useState } from "react";
import { useParams, useLocation } from 'react-router-dom';
import VideoModal from "./components/VideoModal";

function App() {
  const [search, setSearch] = useState("");
  const [previewKey, setPreviewKey] = useState("");
  const [editKey, setEditKey] = useState();
  const location = useLocation();
  
  // This lets the modal open "on top of" the existing page.
  const background = location.state && location.state.background;

  
  
  // const [CR, setCR] = useState("");

  const handleGets = (input) => {
    setSearch(input);
  };

  //一个搜索植物的Wrapper
  function SearchWithParam({ handleEditPage, dbType }) {
    const { plantKey } = useParams();  

    if(dbType === "plant"){
      //plantkKey是url中的植物名
      return (
        <Database
          search={plantKey.replace("_", " ")}
          handleEditPage={handleEditPage}
        />
      );
    }else{
      //plantkKey是url中的植物名
      return (
        <BirdDatabase
          search={plantKey.replace("_", " ")}
          handleEditPage={handleEditPage}
        />
      );
    }
    
  }

  // const handleAdminPreview = (input) => {
  //   setPreviewKey(input);
  // };

  const handleEditPage = (plant) => {
    setEditKey(plant);
  };

  return (
    <UserProvider>
      <PrimeReactProvider>
        {/* <Router> */}
          <div className="App">
            <Routes location={background || location}>
              {/* <Route
                path="/"
                element={
                  <>
                    <Home handleGets={handleGets} />
                  </>
                }
              /> */}
              <Route
                path="/KQsfhwifheKDFJfkdfjdkfjd3q3puod0d0"
                element={
                  <>
                    <Login />
                  </>
                }
              />
              <Route
                path="/SdIkdishfijeldifh!kdjfieh"
                element={
                  <>
                    <Register />
                  </>
                }
              />
              <Route
                path="/databasePlant"
                element={
                  <>
                    <Database handleEditPage={handleEditPage} DbType="plant" />
                  </>
                }
              />
              <Route
                path="/databaseBird"
                element={
                  <>
                    <BirdDatabase handleEditPage={handleEditPage} DbType="bird" />
                  </>
                }
              />
              <Route
                path="/upload"
                element={
                  <>
                    <Upload />
                  </>
                }
              />
              <Route
                path="/editPage"
                element={
                  <>
                    <EditPage editKey={editKey} />
                  </>
                }
              />
              <Route
                path="/"
                element = {<><Database handleEditPage={handleEditPage} DbType="plant" /> </>}
              />
              <Route
                path="/home"
                element = {<> <Home handleGets={handleGets} /> </>}
              />
              <Route
                path="/birdEditPage"
                element={
                  <>
                    <BirdEditPage editKey={editKey} />
                  </>
                }
              />
              <Route
                path="/glossary"
                element={
                  <>
                    <Glossary handleGets={handleGets} />
                  </>
                }
              />
              <Route
                path="/glossaryBird"
                element={
                  <>
                    <BirdGlossary handleGets={handleGets} />
                  </>
                }
              />
              <Route
                path="/search"
                element={
                  <>
                    <Database search={search} handleEditPage={handleEditPage} />
                  </>
                }
              />
              <Route
                path="/search/:plantKey"
                element={
                  <>
                    <SearchWithParam handleEditPage={handleEditPage} dbType="plant" />
                  </>
                }
              />

              <Route
                path="/searchBird/:plantKey"
                element={
                  <>
                    <SearchWithParam handleEditPage={handleEditPage} dbType="bird"/>
                  </>
                }
              >
                {/* <Route path=":subpageID" element = {<SubPageComponent/>}></Route> */}

              </Route>


              <Route
                path="/creation"
                element={
                  <>
                    <Creation currentPage="paintings" handleGets={handleGets} />
                  </>
                }
              />

              <Route path="/video/:vidKey" element={<VideoModal />} />

              <Route
                path="/aboutus"
                element={
                  <>
                    <AboutUs />
                  </>
                }
              />
              <Route
                path="/activities"
                element={
                  <>
                    <Activities />
                  </>
                }
              />
              <Route
                path="/adminView"
                element={<AdminView search={previewKey} />}
              />
              <Route
                path="/adminAuth"
                element={
                  <>
                    <AdminAuth />
                  </>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        {/* </Router> */}
      </PrimeReactProvider>
    </UserProvider>
  );
}

export default App;
