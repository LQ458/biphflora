import React, { useEffect, useRef, useState } from "react";

const normalizeFallbacks = (fallbackSrc) =>
  (Array.isArray(fallbackSrc) ? fallbackSrc : [fallbackSrc]).filter(Boolean);

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
  const [currentSrcSet, setCurrentSrcSet] = useState(imageProps.srcSet);
  const [failed, setFailed] = useState(!src);
  const fallbackIndex = useRef(0);
  const fallbacks = normalizeFallbacks(fallbackSrc);
  const fallbackKey = fallbacks.join("\n");

  useEffect(() => {
    fallbackIndex.current = 0;
    setCurrentSrc(src);
    setCurrentSrcSet(imageProps.srcSet);
    setFailed(!src);
  }, [fallbackKey, imageProps.srcSet, src]);

  const handleError = (event) => {
    const nextFallback = fallbacks
      .slice(fallbackIndex.current)
      .find((candidate) => candidate !== currentSrc);

    if (nextFallback) {
      fallbackIndex.current = fallbacks.indexOf(nextFallback) + 1;
      setCurrentSrcSet(undefined);
      setCurrentSrc(nextFallback);
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
      srcSet={currentSrcSet}
      loading={loading}
      decoding={decoding}
      alt={alt}
      onError={handleError}
    />
  );
};

export default MediaImage;
