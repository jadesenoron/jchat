"use strict";

var _path = _interopRequireDefault(require("path"));
var _express = _interopRequireDefault(require("express"));
var _expressFileupload = _interopRequireDefault(require("express-fileupload"));
var _compression = _interopRequireDefault(require("compression"));
var _cookieParser = _interopRequireDefault(require("cookie-parser"));
var _cors = _interopRequireDefault(require("cors"));
var _helmet = _interopRequireDefault(require("helmet"));
var _morgan = _interopRequireDefault(require("morgan"));
var _mongoose = _interopRequireDefault(require("mongoose"));
var routes = _interopRequireWildcard(require("./routes"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/* eslint-disable no-console */

const app = (0, _express.default)();
// database setup
const mongoUri = process && process.env && process.env.MONGODB_URI || "mongodb+srv://group9:pasarnami@cluster0.x1iusak.mongodb.net/jchat?retryWrites=true&w=majority" || 'mongodb://127.0.0.1:27017/jchat';
const mongooseConfigs = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};
_mongoose.default.connect(mongoUri, mongooseConfigs);
app.use((0, _morgan.default)('dev'));
app.use(_express.default.json());
app.use(_express.default.urlencoded({
  extended: false
}));
app.use((0, _cookieParser.default)());
app.use((0, _helmet.default)());
app.use((0, _cors.default)());
app.use((0, _compression.default)());
app.use((0, _expressFileupload.default)({
  limits: {
    fileSize: 20 * 1024 * 1024
  },
  // limit to 20MB
  useTempFiles: true // use temporary file storage instead of memory RAM
}));

app.use(_express.default.static(_path.default.join(__dirname, "..", "frontend", "build")));
app.use(_express.default.static(_path.default.join(__dirname, "public")));
app.use(_express.default.static(_path.default.join(__dirname, "..", "public")));
app.use('/api/users', routes.users);
app.use('/api/uploadphoto', routes.uploadphoto);
app.use('/api/chat', routes.chat);
app.get("*", (req, res, next) => {
  res.sendFile(_path.default.join(__dirname, "..", "frontend", "build", "index.html"));
});

// handle errors
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).json({
    error: err
  });
});
module.exports = app;