import "./App.css";
import React, { lazy, Suspense, useState } from "react";
import { Route, Routes, useLocation, useParams } from "react-router-dom";
import { PrimeReactProvider } from "primereact/api";
import "primereact/resources/themes/saga-green/theme.css";
import "primeicons/primeicons.css";
import "primereact/resources/primereact.min.css";
import "primeflex/primeflex.css";
import Database from "./pages/Database";
import NotFound from "./pages/NotFound";
import { UserProvider } from "./UserContext";

const AboutUs = lazy(() => import("./pages/AboutUs"));
const Activities = lazy(() => import("./pages/Activities"));
const AdminAuth = lazy(() => import("./components/AdminAuth"));
const AdminView = lazy(() => import("./components/AdminView"));
const BirdDatabase = lazy(() => import("./pages/BirdDatabase"));
const BirdEditPage = lazy(() => import("./pages/BirdEditPage"));
const BirdGlossary = lazy(() => import("./pages/BirdGlossary"));
const Creation = lazy(() => import("./pages/Creation"));
const EditPage = lazy(() => import("./pages/EditPage"));
const Glossary = lazy(() => import("./pages/Glossary"));
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Upload = lazy(() => import("./pages/Upload"));
const VideoModal = lazy(() => import("./components/VideoModal"));

function SearchWithParam({ handleEditPage, dbType }) {
  const { plantKey } = useParams();
  const search = plantKey.replaceAll("_", " ");

  if (dbType === "plant") {
    return <Database search={search} handleEditPage={handleEditPage} />;
  }

  return <BirdDatabase search={search} handleEditPage={handleEditPage} />;
}

function RouteLoading() {
  return (
    <div className="routeLoading" role="status" aria-live="polite">
      Loading…
    </div>
  );
}

function App() {
  const [search, setSearch] = useState("");
  const [editKey, setEditKey] = useState();
  const location = useLocation();
  const background = location.state && location.state.background;

  const handleEditPage = (plant) => {
    setEditKey(plant);
  };

  return (
    <UserProvider>
      <PrimeReactProvider>
        <div className="App">
          <main>
            <Suspense fallback={<RouteLoading />}>
              <Routes location={background || location}>
              <Route
                path="/KQsfhwifheKDFJfkdfjdkfjd3q3puod0d0"
                element={<Login />}
              />
              <Route path="/SdIkdishfijeldifh!kdjfieh" element={<Register />} />
              <Route
                path="/databasePlant"
                element={
                  <Database handleEditPage={handleEditPage} DbType="plant" />
                }
              />
              <Route
                path="/databaseBird"
                element={
                  <BirdDatabase handleEditPage={handleEditPage} DbType="bird" />
                }
              />
              <Route path="/upload" element={<Upload />} />
              <Route
                path="/editPage"
                element={<EditPage editKey={editKey} />}
              />
              <Route
                path="/"
                element={
                  <Database handleEditPage={handleEditPage} DbType="plant" />
                }
              />
              <Route path="/home" element={<Home handleGets={setSearch} />} />
              <Route
                path="/birdEditPage"
                element={<BirdEditPage editKey={editKey} />}
              />
              <Route
                path="/glossary"
                element={<Glossary handleGets={setSearch} />}
              />
              <Route
                path="/glossaryBird"
                element={<BirdGlossary handleGets={setSearch} />}
              />
              <Route
                path="/search"
                element={
                  <Database search={search} handleEditPage={handleEditPage} />
                }
              />
              <Route
                path="/search/:plantKey"
                element={
                  <SearchWithParam
                    handleEditPage={handleEditPage}
                    dbType="plant"
                  />
                }
              />
              <Route
                path="/searchBird/:plantKey"
                element={
                  <SearchWithParam
                    handleEditPage={handleEditPage}
                    dbType="bird"
                  />
                }
              />
              <Route
                path="/creation"
                element={
                  <Creation currentPage="paintings" handleGets={setSearch} />
                }
              />
              <Route path="/video/:vidKey" element={<VideoModal />} />
              <Route path="/aboutus" element={<AboutUs />} />
              <Route path="/activities" element={<Activities />} />
              <Route path="/adminView" element={<AdminView search="" />} />
              <Route path="/adminAuth" element={<AdminAuth />} />
              <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </PrimeReactProvider>
    </UserProvider>
  );
}

export default App;
