import HttpError from "@exceptions/httpError";

export default () => {
  throw new HttpError("Could not find this route", 404);
};
