import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/videoModal.css';
import ReactPlayer from 'react-player'




function VideoModal() {
  const { vidKey } = useParams(); // Gets the video ID from the URL (e.g., 'dQw4w9WgXcQ')
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(-1); // Go back to the previous page
  };

  const url = `https://youtu.be/${vidKey}`

  return (
    // The overlay div, which closes the modal when clicked
    <div className="modal-overlay" onClick={handleClose}>
      {/* The modal content, stopping click propagation to prevent closing */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        <ReactPlayer className='react-player' src={url} width="75rem" height="40rem"/>
        <button className="close-button" onClick={handleClose}>Back</button>
      </div>
    </div>
  );
}

export default VideoModal;