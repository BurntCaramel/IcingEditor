
export DesignationRecord = Immutable.Record({
  identifier: null,
  title: null
});

export function add({ identifier, title }) {}

export function changeTitle({ identifier, title }) {}

export function remove({ identifier }) {}

export const introspection = {
  getDesignationRecordsSortedAlphabetically({ ascending }) {}
}
