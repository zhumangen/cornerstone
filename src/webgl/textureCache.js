/**
 * This module deals with caching image textures in VRAM for WebGL
 */

export const imageCache = {};

export const cachedImages = [];

let maximumSizeInBytes = 1024 * 1024 * 256; // 256 MB
let cacheSizeInBytes = 0;

export function getCacheInfo () {
  return {
    maximumSizeInBytes,
    cacheSizeInBytes,
    numberOfImagesCached: cachedImages.length
  };
}

function purgeCacheIfNecessary () {
    // If max cache size has not been exceeded, do nothing
  if (cacheSizeInBytes <= maximumSizeInBytes) {
    return;
  }

    // Cache size has been exceeded, create list of images sorted by timeStamp
    // So we can purge the least recently used image
  function compare (a, b) {
    if (a.timeStamp > b.timeStamp) {
      return -1;
    }
    if (a.timeStamp < b.timeStamp) {
      return 1;
    }

    return 0;
  }
  cachedImages.sort(compare);

    // Remove images as necessary
  while (cacheSizeInBytes > maximumSizeInBytes) {
    const lastCachedImage = cachedImages[cachedImages.length - 1];

    cacheSizeInBytes -= lastCachedImage.sizeInBytes;
    delete imageCache[lastCachedImage.imageId];
    cachedImages.pop();
    $(cornerstone).trigger('CornerstoneWebGLTextureRemoved', { imageId: lastCachedImage.imageId });
  }

  const cacheInfo = getCacheInfo();

  console.log('CornerstoneWebGLTextureCacheFull');
  $(cornerstone).trigger('CornerstoneWebGLTextureCacheFull', cacheInfo);
}

export function setMaximumSizeBytes (numBytes) {
  if (numBytes === undefined) {
    throw 'setMaximumSizeBytes: parameter numBytes must not be undefined';
  }
  if (numBytes.toFixed === undefined) {
    throw 'setMaximumSizeBytes: parameter numBytes must be a number';
  }

  maximumSizeInBytes = numBytes;
  purgeCacheIfNecessary();
}

export function putImageTexture (image, imageTexture) {
  const imageId = image.imageId;

  if (image === undefined) {
    throw 'putImageTexture: image must not be undefined';
  }

  if (imageId === undefined) {
    throw 'putImageTexture: imageId must not be undefined';
  }

  if (imageTexture === undefined) {
    throw 'putImageTexture: imageTexture must not be undefined';
  }

  if (Object.prototype.hasOwnProperty.call(imageCache, imageId) === true) {
    throw 'putImageTexture: imageId already in cache';
  }

  const cachedImage = {
    imageId,
    imageTexture,
    timeStamp: new Date(),
    sizeInBytes: imageTexture.sizeInBytes
  };

  imageCache[imageId] = cachedImage;
  cachedImages.push(cachedImage);

  if (imageTexture.sizeInBytes === undefined) {
    throw 'putImageTexture: imageTexture does not have sizeInBytes property or';
  }
  if (imageTexture.sizeInBytes.toFixed === undefined) {
    throw 'putImageTexture: imageTexture.sizeInBytes is not a number';
  }
  cacheSizeInBytes += cachedImage.sizeInBytes;
  purgeCacheIfNecessary();
}

export function getImageTexture (imageId) {
  if (imageId === undefined) {
    throw 'getImageTexture: imageId must not be undefined';
  }
  const cachedImage = imageCache[imageId];

  if (cachedImage === undefined) {
    return undefined;
  }

    // Bump time stamp for cached image
  cachedImage.timeStamp = new Date();

  return cachedImage.imageTexture;
}

export function removeImageTexture (imageId) {
  if (imageId === undefined) {
    throw 'removeImageTexture: imageId must not be undefined';
  }
  const cachedImage = imageCache[imageId];

  if (cachedImage === undefined) {
    throw 'removeImageTexture: imageId must not be undefined';
  }
  cachedImages.splice(cachedImages.indexOf(cachedImage), 1);
  cacheSizeInBytes -= cachedImage.sizeInBytes;
  delete imageCache[imageId];

  return cachedImage.imageTexture;
}

export function purgeCache () {
  while (cachedImages.length > 0) {
    const removedCachedImage = cachedImages.pop();

    delete imageCache[removedCachedImage.imageId];
  }
  cacheSizeInBytes = 0;
}

export const textureCache = {
  purgeCache,
  getImageTexture,
  putImageTexture,
  removeImageTexture,
  setMaximumSizeBytes
};
