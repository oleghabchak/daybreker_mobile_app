export type AsyncResponse<T, E = Error> =
  | { status: 'ok'; data: T }
  | { status: 'error'; error: E };
