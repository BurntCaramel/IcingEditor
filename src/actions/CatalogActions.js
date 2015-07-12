
export function addElementAtIndexUsingIdentifier({catalogIdentifier, element, index, elementIdentifier}) {
  return {
    catalogIdentifier,
    element,
    index,
    elementIdentifier,
  };
};

export function updateDesignationsForElementWithIdentifier({catalogIdentifier, elementIdentifier, tagsUpdater}) {
  return {
    catalogIdentifier,
    elementIdentifier,
    tagsUpdater,
  };
}

export function removeElementWithIdentifier({catalogIdentifier, elementIdentifier}) {
  return {
    catalogIdentifier,
    elementIdentifier,
  };
}
