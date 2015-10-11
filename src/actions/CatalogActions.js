
export function addElement({ identifier, element }) {}

//export function updateDesignationsForElement({ identifier, tagsUpdater }) {}
export function addDesignationToElement({ identifier, designationIdentifier }) {}
export function removeDesignationFromElement({ identifier, designationIdentifier }) {}

export function removeElement({ identifier }) {}

export const introspection = {
  getElementsSortedByDesignations({ ascending }) {}
}
