
export function addURL({ URL }) {}

export function addDesignationToURL({ URL, designationIdentifier }) {}
export function removeDesignationFromURL({ URL, designationIdentifier }) {}

export function removeURL({ URL }) {}


export const introspection = {
  getURLsSortedAlphabetically({ ascending }) {}

  getURLsSortedByDesignations({ ascending }) {}
};
