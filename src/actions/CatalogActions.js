
export function addElementAtIndexUsingIdentifier({catalogIdentifier, element, index, elementIdentifier}) {
  return {
    eventID: 'CatalogActions.addElementAtIndexUsingIdentifier',
    catalogIdentifier,
    element,
    index,
    elementIdentifier,
  };
};

export function updateDesignationsForElementWithIdentifier({catalogIdentifier, elementIdentifier, tagsUpdater}) {
  return {
    eventID: 'CatalogActions.updateDesignationsForElementWithIdentifier',
    catalogIdentifier,
    elementIdentifier,
    tagsUpdater,
  };
}

export function removeElementWithIdentifier({catalogIdentifier, elementIdentifier}) {
  return {
    eventID: 'CatalogActions.removeElementWithIdentifier',
    catalogIdentifier,
    elementIdentifier,
  };
}
