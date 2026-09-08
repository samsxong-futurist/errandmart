import { app } from "../backend/app.js";
function handler(...args) {
  return app(...args);
}
export {
  handler as default
};
