import React, { useEffect, useRef, useState } from "react";

const MediaImage = ({
  src,
  fallbackSrc,
  failedContent = null,
  loading = "lazy",
  decoding = "async",
  alt,
  onError,
  ...imageProps
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [failed, setFailed] = useState(!src);
  const fallbackAttempted = useRef(false);

  useEffect(() => {
    fallbackAttempted.current = false;
    setCurrentSrc(src);
    setFailed(!src);
  }, [fallbackSrc, src]);

  const handleError = (event) => {
    if (
      !fallbackAttempted.current &&
      fallbackSrc &&
      fallbackSrc !== currentSrc
    ) {
      fallbackAttempted.current = true;
      setCurrentSrc(fallbackSrc);
      return;
    }

    setFailed(true);
    onError?.(event);
  };

  if (failed) {
    return failedContent;
  }

  return (
    <img
      {...imageProps}
      src={currentSrc}
      loading={loading}
      decoding={decoding}
      alt={alt}
      onError={handleError}
    />
  );
};

export default MediaImage;
