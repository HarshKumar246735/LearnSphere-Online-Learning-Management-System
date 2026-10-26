// validate({ body, query, params }) with Zod schemas. Parsed values replace the originals, and zod's default
// object parsing strips unknown keys, which blocks mass assignment (e.g. a client sending role: "admin").
export default (schemas) => (req, _res, next) => {
  try {
    if (schemas.body) req.body = schemas.body.parse(req.body);
    if (schemas.params) req.params = schemas.params.parse(req.params);
    if (schemas.query) Object.defineProperty(req, 'query', { value: schemas.query.parse(req.query), writable: true });
    next();
  } catch (err) {
    next(err);
  }
};
