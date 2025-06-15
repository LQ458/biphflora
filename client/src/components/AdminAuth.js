import axios from "axios";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Toast } from "primereact/toast";
import { Carousel } from "primereact/carousel";
import "../styles/AdminAuth.css";

const AdminAuth = ({ admin }) => {
  const navigate = useNavigate();
  const [unAuthPosts, setUnAuthPosts] = useState([]);
  const [unAuthNewPosts, setUnAuthNewPosts] = useState([]);
  const [unAuthCreationEntry, setUnAuthCreationEntry] = useState([]);
  const [currentChange, setCurrentChange] = useState(0);
  const [newCurrentChange, setNewCurrentChange] = useState(0);
  const [artCurrentChange, setArtCurrentChange] = useState(0);
  const toast = useRef(null);

  const handleEditDecision = async (id, decision) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_Source_URL}/handleEditDecision`,
        { id: id, decision: decision },
      );
      setUnAuthPosts((prevPosts) =>
        prevPosts.filter((post) => post._id !== id),
      );
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: decision ? "Edit approved" : "Edit rejected",
      });
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to process decision",
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_Source_URL}/adminAuth`,
        );
        if (!admin) {
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: "You are not authorized to view this page",
          });
          navigate("/");
          return;
        }
        setUnAuthPosts(response.data.authPosts);
        setUnAuthNewPosts(response.data.newAuthPosts);
        setUnAuthCreationEntry(response.data.newCreationEntries);
      } catch (error) {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to fetch data",
        });
      }
    };

    fetchData();
  }, [navigate, admin]);

  const handleNewCreationDecision = async (decision, id) => {
    try {
      await axios.post(`${process.env.REACT_APP_Source_URL}/newCreationAuth`, {
        id: id,
        decision: decision,
      });
      setUnAuthCreationEntry((prevPosts) =>
        prevPosts.filter((post) => post._id !== id),
      );
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: decision ? "Creation approved" : "Creation rejected",
      });
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to process decision",
      });
    }
  };

  const handleNewPostDecision = async (decision, id) => {
    try {
      await axios.post(`${process.env.REACT_APP_Source_URL}/newPostAuth`, {
        id: id,
        decision: decision,
      });
      setUnAuthNewPosts((prevPosts) =>
        prevPosts.filter((post) => post._id !== id),
      );
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: decision ? "Post approved" : "Post rejected",
      });
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to process decision",
      });
    }
  };

  const handleLeft = (change, setChange) => {
    if (change > 0) {
      setChange(change - 1);
    }
  };

  const handleRight = (change, setChange, posts) => {
    if (change < posts.length - 1) {
      setChange(change + 1);
    }
  };

  const responsiveOptions = [
    {
      breakpoint: "1199px",
      numVisible: 1,
      numScroll: 1,
    },
  ];

  const editRequestTemplate = (item) => (
    <Card className="auth-card m-3">
      <h2 className="plantNameTitle">
        Name: <em>{item.latinName}</em> {item.commonName} {item.chineseName}{" "}
        (Edit Request)
      </h2>
      <div className="auth-content">
        <h3>Common Names: {item.commonName}</h3>
        <h3>Location 位置: {item.location}</h3>
        <h3>Additional Info: {item.additionalInfo}</h3>
        <h2>Encyclopedia 百科介绍</h2>
        <h2>(English)</h2>
        {item.link.length === 0 && <h3>No entries</h3>}
        {Array.isArray(item.link) &&
          item.link.map((link, index) => (
            <div key={index}>
              <li className="Chi">
                {link.linkTitle}: {link.link}
              </li>
            </div>
          ))}
        <h2>(Chinese)</h2>
        {item.chineseLink.length === 0 && <h3>No entries</h3>}
        {Array.isArray(item.chineseLink) &&
          item.chineseLink.map((link, index) => (
            <div key={index}>
              <li className="Chi">
                {link.linkTitle}: {link.link}
              </li>
            </div>
          ))}
          <h3>
            Editor: {item.editor}
          </h3>
          <h3>
            Date: {item.postingtime}
          </h3>
      </div>
      <div className="flex justify-content-end gap-2 mt-3">
        <Button
          label="Reject"
          icon="pi pi-times"
          onClick={() => handleEditDecision(item._id, false)}
          className="p-button-danger"
        />
        <Button
          label="Approve"
          icon="pi pi-check"
          onClick={() => handleEditDecision(item._id, true)}
          className="p-button-success"
        />
      </div>
      
    </Card>
  );

  const newPostTemplate = (item) => (
    <Card className="auth-card m-3">
      <h2 className="plantNameTitle">
        Name: <em>{item.latinName}</em> {item.commonName} {item.chineseName}
      </h2>
      <div className="auth-content">
        <h3>Common Names: {item.commonName}</h3>
        <h3>Location 位置: {item.location}</h3>
        <h3>Additional Info: {item.additionalInfo}</h3>
        <h3>Encyclopedia 百科介绍</h3>
        <h3>(English)</h3>
        {item.link.length === 0 && <li className="Chi">No Entries</li>}
        {Array.isArray(item.link) &&
          item.link.map((link, index) => (
            <div key={index}>
              <li className="Eng">
                {link.linkTitle}: {link.link}
              </li>
            </div>
          ))}
        <h3>(Chinese)</h3>
        {item.chineseLink.length === 0 && <li className="Chi">No Entries</li>}
        {Array.isArray(item.chineseLink) &&
          item.chineseLink.map((link, index) => (
            <div key={index}>
              <li className="Chi">
                {link.linkTitle}: {link.link}
              </li>
            </div>
          ))}
        <h3>
          Editor: {item.editor}
        </h3>
        <h3>
          Date: {item.postingtime}
        </h3>
      </div>
      <div className="flex justify-content-end gap-2 mt-3">
        <Button
          label="Delete"
          icon="pi pi-trash"
          onClick={() => handleNewPostDecision(false, item._id)}
          className="p-button-danger"
        />
        <Button
          label="Submit"
          icon="pi pi-check"
          onClick={() => handleNewPostDecision(true, item._id)}
          className="p-button-success"
        />
      </div>
    </Card>
  );

  const creationEntryTemplate = (item) => (
    <Card className="auth-card m-3">
      <h2 className="plantNameTitle">Name: {item.name}</h2>
      <div className="flex gap-3">
        <div className="flex-1">
          <img
            src={`${process.env.REACT_APP_Source_URL}/public/compressed${item.pic}`}
            alt={item.pic}
            className="w-full"
          />
          <h3 className="text-center mt-2">Picture</h3>
        </div>
        <div className="flex-1">
          <img
            src={`${process.env.REACT_APP_Source_URL}/public/compressed${item.art}`}
            alt={item.art}
            className="w-full"
          />
          <h3 className="text-center mt-2">Artwork</h3>
        </div>
      </div>
      <div className="flex justify-content-end gap-2 mt-3">
        <Button
          label="Deny"
          icon="pi pi-times"
          onClick={() => handleNewCreationDecision(false, item._id)}
          className="p-button-danger"
        />
        <Button
          label="Approve"
          icon="pi pi-check"
          onClick={() => handleNewCreationDecision(true, item._id)}
          className="p-button-success"
        />
      </div>
    </Card>
  );

  return (
    <div className="authBody">
      <Toast ref={toast} />
      <h1 className="titleAdmin">Admin Authentication</h1>

      <div className="unAuthChanges">
        <h1 className="titleSections">Unauthorized Changes</h1>
        {unAuthPosts.length > 0 ? (
          <Carousel
            value={unAuthPosts}
            numVisible={1}
            numScroll={1}
            responsiveOptions={responsiveOptions}
            itemTemplate={editRequestTemplate}
            circular
          />
        ) : (
          <p className="text-center">No unauthorized changes</p>
        )}
      </div>

      <div className="unAuthPosts">
        <h1 className="titleSections">Unauthorized New Posts</h1>
        {unAuthNewPosts.length > 0 ? (
          <Carousel
            value={unAuthNewPosts}
            numVisible={1}
            numScroll={1}
            responsiveOptions={responsiveOptions}
            itemTemplate={newPostTemplate}
            circular
          />
        ) : (
          <p className="text-center">No unauthorized posts</p>
        )}
      </div>

      <div className="unAuthCreation">
        <h1 className="titleSections">Unauthorized New Creation Entry</h1>
        {unAuthCreationEntry.length > 0 ? (
          <Carousel
            value={unAuthCreationEntry}
            numVisible={1}
            numScroll={1}
            responsiveOptions={responsiveOptions}
            itemTemplate={creationEntryTemplate}
            circular
          />
        ) : (
          <p className="text-center">No unauthorized creation entries</p>
        )}
      </div>
    </div>
  );
};

export default AdminAuth;
