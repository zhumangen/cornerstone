/**
 * This module contains a function to immediately invalidate an image
 */

import { getEnabledElementsByImageId } from './enabledElements.js';
import { drawImage } from './internal/drawImage.js';

/**
 * Forces the image to be updated/redrawn for the specified enabled element
 * @param element
 */
export function invalidateImageId (imageId) {

  const enabledElements = getEnabledElementsByImageId(imageId);

  enabledElements.forEach(function (enabledElement) {
    drawImage(enabledElement, true);
  });
}
