"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uploadPhoto = void 0;
var _path = _interopRequireDefault(require("path"));
var _fs = require("fs");
var _promises = require("fs/promises");
var _crypto = require("crypto");
var _models = require("../models");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const mimeTypes = {
  'image/png': '.png',
  'image/jpeg': '.jpeg',
  'image/gif': '.gif'
};
function cleanUpTempFiles([...photo]) {
  return new Promise(async (resolve, reject) => {
    let removed = [];
    try {
      for (let tmpphoto of photo) {
        if (tmpphoto !== null) {
          if ((0, _fs.existsSync)(tmpphoto.tempFilePath)) {
            await (0, _promises.rm)(tmpphoto.tempFilePath);
            removed.push(tmpphoto.tempFilePath);
          }
        }
      }
      resolve(removed);
    } catch (err) {
      reject(err);
    }
  });
}
const uploadPhoto = async (req, res, next) => {
  const allfiles = req.files ? req.files : {};
  const photo = allfiles.photo;
  for (let otherkey of Object.keys(allfiles)) {
    if (otherkey !== 'photo') {
      try {
        await cleanUpTempFiles(Array.isArray(allfiles[otherkey]) ? [...allfiles[otherkey]] : [allfiles[otherkey]]);
      } catch (ee) {
        console.log("error delete", ee);
      }
    }
  }
  const {
    userid,
    forProfile
  } = req.body ? req.body : {};
  try {
    const isForProfile = JSON.parse(forProfile);
    if (!(photo && typeof isForProfile === 'boolean')) {
      return res.status(403).json('Invalid Request!');
    }
    const uid = userid ? userid.trim() : false;
    const doc = uid ? await _models.User.findById(uid) : false;
    const files = [];
    if (!(0, _fs.existsSync)(_path.default.join(__dirname, "..", "..", "public"))) {
      await (0, _promises.mkdir)(_path.default.join(__dirname, "..", "..", "public"));
    }
    if (!doc && isForProfile) {
      // for profile photo only
      const filetoupload = Array.isArray(photo) && photo.length > 1 ? photo[0] : photo;
      const randomFilename = (0, _crypto.randomBytes)(16).toString("hex") + mimeTypes[filetoupload.mimetype];
      const randId = `${Math.random() * 99999999999}`;
      const publicPath = `profile-photo/${randId}/${randomFilename}`;
      if (!(0, _fs.existsSync)(_path.default.join(__dirname, "..", "..", "public", 'profile-photo'))) {
        await (0, _promises.mkdir)(_path.default.join(__dirname, "..", "..", "public", 'profile-photo'));
      }
      if (!(0, _fs.existsSync)(_path.default.join(__dirname, "..", "..", "public", 'profile-photo', randId))) {
        await (0, _promises.mkdir)(_path.default.join(__dirname, "..", "..", "public", 'profile-photo', randId));
      }
      const savePath = _path.default.join(__dirname, "..", "..", "public", 'profile-photo', randId, randomFilename);
      await filetoupload.mv(savePath);
      files.push({
        filepath: '/' + publicPath,
        filedir: '/' + publicPath.split('/').filter(v => v.match(mimeTypes[filetoupload.mimetype]) === null).join('/') + '/',
        filename: randomFilename,
        basename: randomFilename.split('.')[0],
        file_extension: mimeTypes[filetoupload.mimetype],
        mimetype: filetoupload.mimetype,
        size: filetoupload.size
      });
    } else {
      // for chat uploads
      if (!photo) {
        return res.json({
          error: {
            status: 400,
            statusCode: 400,
            message: 'No files to upload!'
          }
        });
      }
      if (isForProfile) {
        // for profile photo
        const filetoupload = Array.isArray(photo) && photo.length > 1 ? photo[0] : photo;
        const randomFilename = (0, _crypto.randomBytes)(16).toString("hex") + mimeTypes[filetoupload.mimetype];
        const publicPath = `profile-photo/${uid}/${randomFilename}`;
        if (!(0, _fs.existsSync)(_path.default.join(__dirname, "..", "..", "public", 'profile-photo'))) {
          await (0, _promises.mkdir)(_path.default.join(__dirname, "..", "..", "public", 'profile-photo'));
        }
        if (!(0, _fs.existsSync)(_path.default.join(__dirname, "..", "..", "public", 'profile-photo', uid))) {
          await (0, _promises.mkdir)(_path.default.join(__dirname, "..", "..", "public", 'profile-photo', uid));
        }
        const savePath = _path.default.join(__dirname, "..", "..", "public", 'profile-photo', uid, randomFilename);
        await filetoupload.mv(savePath);
        files.push({
          filepath: '/' + publicPath,
          filedir: '/' + publicPath.split('/').filter(v => v.match(mimeTypes[filetoupload.mimetype]) === null).join('/') + '/',
          filename: randomFilename,
          basename: randomFilename.split('.')[0],
          file_extension: mimeTypes[filetoupload.mimetype],
          mimetype: filetoupload.mimetype,
          size: filetoupload.size
        });
      } else {
        // for messenger chat photo
        if (!(0, _fs.existsSync)(_path.default.join(__dirname, "..", "..", "public", 'chat-photo'))) {
          await (0, _promises.mkdir)(_path.default.join(__dirname, "..", "..", "public", 'chat-photo'));
        }
        if (!(0, _fs.existsSync)(_path.default.join(__dirname, "..", "..", "public", 'chat-photo', uid))) {
          await (0, _promises.mkdir)(_path.default.join(__dirname, "..", "..", "public", 'chat-photo', uid));
        }
        if (Array.isArray(photo)) {
          // multiple photos
          for (const filetoupload of photo) {
            const randomFilename = (0, _crypto.randomBytes)(16).toString("hex") + mimeTypes[filetoupload.mimetype];
            const publicPath = `chat-photo/${uid}/${randomFilename}`;
            const savePath = _path.default.join(__dirname, "..", "..", "public", 'chat-photo', uid, randomFilename);
            await filetoupload.mv(savePath);
            files.push({
              filepath: '/' + publicPath,
              filedir: '/' + publicPath.split('/').filter(v => v.match(mimeTypes[filetoupload.mimetype]) === null).join('/') + '/',
              filename: randomFilename,
              basename: randomFilename.split('.')[0],
              file_extension: mimeTypes[filetoupload.mimetype],
              mimetype: filetoupload.mimetype,
              size: filetoupload.size
            });
          }
        } else {
          // single photo
          const randomFilename = (0, _crypto.randomBytes)(16).toString("hex") + mimeTypes[photo.mimetype];
          const publicPath = `chat-photo/${uid}/${randomFilename}`;
          const savePath = _path.default.join(__dirname, "..", "..", "public", 'chat-photo', uid, randomFilename);
          await photo.mv(savePath);
          files.push({
            filepath: '/' + publicPath,
            filedir: '/' + publicPath.split('/').filter(v => v.match(mimeTypes[photo.mimetype]) === null).join('/') + '/',
            filename: randomFilename,
            basename: randomFilename.split('.')[0],
            file_extension: mimeTypes[photo.mimetype],
            mimetype: photo.mimetype,
            size: photo.size
          });
        }
      }
    }
    res.json({
      success: {
        files,
        message: 'Photo Uploaded Sucessfully'
      }
    });
  } catch (error) {
    next(error);
  } finally {
    // clean up temporary files
    try {
      await cleanUpTempFiles(Array.isArray(photo) ? [...photo] : [photo]);
    } catch (ee) {
      console.log("error delete", ee);
    }
  }
};
exports.uploadPhoto = uploadPhoto;