"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "chat", {
  enumerable: true,
  get: function () {
    return _chat.default;
  }
});
Object.defineProperty(exports, "uploadphoto", {
  enumerable: true,
  get: function () {
    return _uploadphoto.default;
  }
});
Object.defineProperty(exports, "users", {
  enumerable: true,
  get: function () {
    return _users.default;
  }
});
var _users = _interopRequireDefault(require("./users"));
var _uploadphoto = _interopRequireDefault(require("./uploadphoto"));
var _chat = _interopRequireDefault(require("./chat"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }