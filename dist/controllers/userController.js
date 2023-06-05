"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.verifyPassword = exports.updateUserPassword = exports.updateUser = exports.updateOnlineStatus = exports.signupUser = exports.loginUser = exports.getUserByQuery = exports.deleteUserAccount = void 0;
var _models = require("../models");
var _bcryptjs = require("bcryptjs");
const signupUser = async (req, res, next) => {
  const {
    _id,
    username,
    password,
    firstname,
    middlename,
    lastname,
    birthday,
    gender,
    civilstatus,
    address,
    aboutme,
    photo
  } = req.body ? req.body : {};
  if (!(username && password && firstname && lastname && birthday && gender && civilstatus && photo)) {
    return res.status(403).json({
      error: {
        status: 403,
        statusCode: 403,
        message: 'Invalid Request!'
      }
    });
  }
  const mybirthday = new Date(Date.parse(birthday));
  try {
    const password_hash = await (0, _bcryptjs.hash)(password, 12);
    const userModel = new _models.User({
      _id: _id ? _id.trim() : undefined,
      username: username.trim(),
      password: password_hash,
      firstname: firstname.trim().split(' ').map(v => v[0].toUpperCase() + v.trim().substring(1).toLowerCase()).join(' '),
      middlename: middlename ? middlename.trim().split(' ').map(v => v[0].toUpperCase() + v.trim().substring(1).toLowerCase()).join(' ') : undefined,
      lastname: lastname.trim().split(' ').map(v => v[0].toUpperCase() + v.trim().substring(1).toLowerCase()).join(' '),
      birthday: mybirthday,
      gender: gender.trim()[0].toLowerCase() === 'f' ? 'Female' : 'Male',
      civilstatus: civilstatus.trim().split(' ').map(v => v[0].toUpperCase() + v.trim().substring(1).toLowerCase()).join(' '),
      address,
      aboutme,
      photo: photo.trim()
    });
    const result = await userModel.save();
    if (result) {
      res.json({
        success: {
          userid: result._id,
          message: 'Successfully Registered!'
        }
      });
    } else {
      res.json({
        error: {
          status: 500,
          statusCode: 500,
          message: 'Failed to register user!'
        }
      });
    }
  } catch (error) {
    console.log(error);
    next({
      status: 500,
      statusCode: 500,
      message: 'Failed to register user!'
    });
  }
};
exports.signupUser = signupUser;
const loginUser = async (req, res, next) => {
  const {
    username,
    password
  } = req.body ? req.body : {};
  if (!(username && password)) {
    return res.status(403).json({
      error: {
        status: 403,
        statusCode: 403,
        message: 'Invalid Request!'
      }
    });
  }
  try {
    const result = await _models.User.findOne({
      username
    }).select('username password');
    if (result) {
      const isValid = await (0, _bcryptjs.compare)(password, result.password);
      if (isValid) {
        res.json({
          success: {
            userid: result._id,
            message: 'Successfully Logged In!'
          }
        });
      } else {
        res.json({
          error: {
            status: 401,
            statusCode: 401,
            message: 'Invalid Username or Password!'
          }
        });
      }
    } else {
      // no username exists
      res.json({
        error: {
          status: 404,
          statusCode: 404,
          message: 'No Username Exists!'
        }
      });
    }
  } catch (error) {
    next(error);
  }
};
exports.loginUser = loginUser;
const getUserByQuery = async (req, res, next) => {
  const {
    query,
    userid,
    username,
    search
  } = req.query ? req.query : {};
  try {
    switch (query) {
      case 'exists':
        {
          if (username) {
            const result = await _models.User.findOne({
              username
            }).select('username');
            if (result) {
              return res.json(true);
            } else {
              return res.json(false);
            }
          } else {
            return res.status(500).json({
              error: 'Invalid Request!'
            });
          }
        }
      case 'userid':
        {
          if (!userid) {
            return res.status(403).json('Invalid Request!');
          }
          const result = await _models.User.findById(userid).select('username firstname middlename lastname birthday gender civilstatus address aboutme photo dateonline');
          if (result) {
            return res.json(result);
          } else {
            return res.json(null);
          }
        }
      case 'search':
        {
          if (typeof search === 'string' && search.trim() !== '') {
            const searchTrimmed = search.trim();
            const results = await Promise.all([await _models.User.find({
              username: {
                $regex: searchTrimmed,
                $options: 'i'
              }
            }).select({
              _id: 0,
              username: 1,
              firstname: 1,
              middlename: 1,
              lastname: 1,
              gender: 1,
              civilstatus: 1,
              aboutme: 1,
              photo: 1,
              dateonline: 1
            }), await _models.User.find({
              firstname: {
                $regex: searchTrimmed,
                $options: 'i'
              }
            }).select({
              _id: 0,
              username: 1,
              firstname: 1,
              middlename: 1,
              lastname: 1,
              gender: 1,
              civilstatus: 1,
              aboutme: 1,
              photo: 1
            }), await _models.User.find({
              middlename: {
                $regex: searchTrimmed,
                $options: 'i'
              }
            }).select({
              _id: 0,
              username: 1,
              firstname: 1,
              middlename: 1,
              lastname: 1,
              gender: 1,
              civilstatus: 1,
              aboutme: 1,
              photo: 1,
              dateonline: 1
            }), await _models.User.find({
              lastname: {
                $regex: searchTrimmed,
                $options: 'i'
              }
            }).select({
              _id: 0,
              username: 1,
              firstname: 1,
              middlename: 1,
              lastname: 1,
              gender: 1,
              civilstatus: 1,
              aboutme: 1,
              photo: 1,
              dateonline: 1
            })]);
            const result = [];
            results.flat().forEach(v => {
              if (!result.includes(v)) {
                result.push(v);
              }
            }, []);
            return res.json(result);
          } else {
            return res.status(500).json({
              error: 'Invalid Request!'
            });
          }
        }
      case 'profile':
        {
          if (!username) {
            return res.status(403).json('Invalid Request!');
          }
          const result = await _models.User.findOne({
            username
          }).select('username firstname middlename lastname birthday gender civilstatus address aboutme photo dateonline');
          if (result) {
            return res.json(result);
          } else {
            return res.json(null);
          }
        }
      default:
        return res.status(403).json({
          error: 'Invalid Request!'
        });
    }
  } catch (error) {
    next(error);
  }
};
exports.getUserByQuery = getUserByQuery;
const updateUser = async (req, res, next) => {
  const userid = req.params ? req.params.userid : null;
  if (!userid) {
    return res.status(403).json('Invalid Request!');
  }
  const {
    firstname,
    middlename,
    lastname,
    birthday,
    gender,
    civilstatus,
    address,
    aboutme,
    photo
  } = req.body ? req.body : {};
  if (!(firstname || middlename || lastname || birthday || gender || civilstatus || address || aboutme || photo)) {
    return res.status(403).json('Invalid Request!');
  }
  const mybirthday = birthday ? new Date(Date.parse(birthday)) : undefined;
  try {
    const doc = await _models.User.findById(userid);
    if (doc) {
      [['firstname', firstname ? firstname.trim()[0].toUpperCase() + firstname.trim().substring(1).toLowerCase() : undefined], ['middlename', middlename ? middlename.trim()[0].toUpperCase() + middlename.trim().substring(1).toLowerCase() : undefined], ['lastname', lastname ? lastname.trim()[0].toUpperCase() + lastname.trim().substring(1).toLowerCase() : undefined], ['birthday', mybirthday], ['gender', gender ? gender.trim()[0].toLowerCase() === 'f' ? 'Female' : 'Male' : undefined], ['civilstatus', civilstatus ? civilstatus.trim()[0].toUpperCase() + civilstatus.trim().substring(1).toLowerCase() : undefined], ['address', address], ['aboutme', aboutme], ['photo', photo ? photo.trim() : undefined]].map(([key, value], i) => {
        if (value) {
          doc[key] = value;
        }
        return true;
      });
      const result = await doc.save();
      if (result) {
        res.json({
          success: {
            userid: result._id,
            message: 'Successfully Updated!'
          }
        });
      } else {
        res.json({
          error: {
            status: 500,
            statusCode: 500,
            message: 'Failed to Update user!'
          }
        });
      }
    } else {
      res.status(500).json({
        error: {
          message: 'No user found to update!'
        }
      });
    }
  } catch (error) {
    next(error);
  }
};
exports.updateUser = updateUser;
const updateUserPassword = async (req, res, next) => {
  const userid = req.params ? req.params.userid : null;
  if (!userid) {
    return res.status(403).json('Invalid Request!');
  }
  const {
    oldpassword,
    newpassword
  } = req.body ? req.body : {};
  if (!(oldpassword && newpassword)) {
    return res.status(403).json('Invalid Request!');
  }
  try {
    const doc = await _models.User.findById(userid).select('password');
    if (!doc) {
      return res.status(404).json('No Such User!');
    }
    const isValid = await (0, _bcryptjs.compare)(oldpassword, doc.password);
    if (isValid) {
      const password = await (0, _bcryptjs.hash)(newpassword, 12);
      doc.password = password;
      const result = await doc.save();
      if (result) {
        res.json({
          success: {
            message: 'Successfully Changed Password!'
          }
        });
      } else {
        res.json({
          error: {
            status: 500,
            statusCode: 500,
            message: 'Failed to Change Password!'
          }
        });
      }
    } else {
      res.status(403).json('Invalid Password!');
    }
  } catch (error) {
    next(error);
  }
};
exports.updateUserPassword = updateUserPassword;
const verifyPassword = async (req, res, next) => {
  const userid = req.params ? req.params.userid : null;
  if (!userid) {
    return res.status(403).json('Invalid Request!');
  }
  const {
    password
  } = req.body ? req.body : {};
  if (!password) {
    return res.status(403).json('Invalid Request!');
  }
  try {
    const doc = await _models.User.findById(userid);
    if (!doc) {
      return res.status(404).json('No Such User!');
    }
    const result = await (0, _bcryptjs.compare)(password, doc.password);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
exports.verifyPassword = verifyPassword;
const updateOnlineStatus = async (req, res, next) => {
  const userid = req.params ? req.params.userid : null;
  try {
    const doc = await _models.User.findById(userid);
    if (!doc) {
      return res.status(404).json({
        error: {
          status: 404,
          statusCode: 404,
          message: 'Invalid Request'
        }
      });
    }
    const dateonline = new Date(Date.now());
    doc.dateonline = dateonline;
    const result = await doc.save();
    if (result) {
      res.json({
        success: {
          message: 'Online Status Updated to ' + dateonline.getTime()
        }
      });
    } else {
      res.status(500).json({
        error: {
          status: 500,
          statusCode: 500,
          message: 'Error updating online status'
        }
      });
    }
  } catch (error) {
    next(error);
  }
};
exports.updateOnlineStatus = updateOnlineStatus;
const deleteUserAccount = async (req, res, next) => {
  const userid = req.params ? req.params.userid : null;
  const {
    password
  } = req.body;
  if (!(userid && password)) {
    return res.status(403).json('Invalid Request!');
  }
  try {
    const doc = await _models.User.findById(userid).select('username password firstname middlename lastname');
    if (!doc) {
      return res.status(403).json('Invalid Request!');
    }
    const password_hash = doc.password;
    const isValid = await (0, _bcryptjs.compare)(password, password_hash);
    if (!isValid) {
      return res.status(403).json('Invalid Password!');
    }
    const result = await doc.deleteOne();
    if (!result) {
      return res.status(500).json({
        error: {
          status: 500,
          statusCode: 500,
          message: 'Failed to Delete Account. Please Try Again Later.'
        }
      });
    }
    res.json({
      success: {
        message: 'Account Deleted Successfully',
        details: {
          userid: result._id,
          username: result.username,
          fullname: `${result.firstname} ${result.middlename} ${result.lastname}`
        }
      }
    });
  } catch (error) {
    next({
      status: 500,
      statusCode: 500,
      message: 'Failed to Delete Account. Please Try Again Later.'
    });
  }
};
exports.deleteUserAccount = deleteUserAccount;