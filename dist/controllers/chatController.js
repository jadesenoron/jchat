"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sendChat = exports.getChatData = void 0;
var _models = require("../models");
var _mongoose = require("mongoose");
const ObjectId = _mongoose.Types.ObjectId;
function initializeChat(userIdA, userIdB) {
  return new Promise((resolve, _) => {
    _models.Chat.findOne({
      'users._id': {
        $all: [userIdA.toString(), userIdB.toString()]
      }
    }).then(oldchat => {
      if (!oldchat) {
        const newchat = new _models.Chat({
          users: [{
            _id: userIdA,
            seenLatest: false
          }, {
            _id: userIdB,
            seenLatest: false
          }],
          conversation: [],
          latestUpdate: {},
          lastUpdated: 0
        });
        newchat.save().then(doc => {
          if (!doc) {
            resolve(false);
          }
          resolve(doc);
        }).catch(() => resolve(false));
      } else {
        resolve(oldchat);
      }
    });
  });
}
function getObjectIdsBySearch(search) {
  return new Promise(resolve => {
    Promise.all([_models.User.find({
      username: {
        $regex: search,
        $options: 'i'
      }
    }).select({
      _id: 1
    }), _models.User.find({
      firstname: {
        $regex: search,
        $options: 'i'
      }
    }).select({
      _id: 1
    }), _models.User.find({
      middlename: {
        $regex: search,
        $options: 'i'
      }
    }).select({
      _id: 1
    }), _models.User.find({
      lastname: {
        $regex: search,
        $options: 'i'
      }
    }).select({
      _id: 1
    })]).then(results => {
      let result = [];
      results.flat().forEach(v => {
        if (!result.includes(v._id.toString())) {
          result.push(v._id.toString());
        }
      }, []);
      resolve(result);
    }).catch(_ => resolve([]));
  });
}
const getChatData = async (req, res, next) => {
  const {
    query,
    from_user,
    to_user,
    chatid
  } = req.query ? req.query : {};
  try {
    switch (query) {
      case 'conversation':
        {
          if (!chatid && !from_user) {
            return res.status(403).json('Invalid Request!');
          }
          const chatdoc = await _models.Chat.findById(chatid).select('users conversation');
          if (!chatdoc) {
            return res.status(403).json('No Conversation Found!');
          }
          const hasUserId = chatdoc.users.filter(({
            _id
          }) => _id.toString() === from_user).length === 1;
          if (!hasUserId) {
            return res.status(403).json('Invalid Conversation!');
          }
          // update seen
          const myuserindex = [...chatdoc.users].map(({
            _id
          }, i) => _id.toString() === from_user ? i : null).filter(v => v !== null)[0];
          chatdoc.users[myuserindex].seenLatest = true;
          await chatdoc.save();
          const sortedConversation = [...chatdoc.conversation].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
          const result = await _models.User.findById(chatdoc.users[1 - myuserindex]._id.toString());
          return res.json({
            success: {
              data: sortedConversation,
              message: 'Chat Conversation Received!',
              chatid: chatdoc._id,
              users: [...chatdoc.users],
              name: result.firstname + ' ' + result.lastname
            }
          });
        }
      case 'search':
        {
          if (!from_user && !to_user) {
            return res.status(403).json('Invalid Request!');
          }
          const to_userids = await getObjectIdsBySearch(to_user);
          if (!to_userids) {
            return res.json({
              success: {
                data: [],
                message: 'No Users Found'
              }
            });
          }
          const chatdocs = await _models.Chat.find({
            'users._id': {
              $all: [from_user],
              $in: [...to_userids]
            },
            lastUpdated: {
              $gt: 0
            }
          }).select('users latestUpdate').sort({
            lastUpdated: -1
          });
          if (!chatdocs) {
            return res.json({
              success: {
                data: [],
                message: 'No Users Found',
                length: 0
              }
            });
          }
          for (let i = 0; i < chatdocs.length; i++) {
            let j = chatdocs[i].users.filter(v => v._id.toString() !== from_user).pop();
            if (j) {
              let result = await _models.User.findById(j);
              chatdocs[i].name = result.firstname + ' ' + result.lastname;
              chatdocs[i].username = result.username;
              chatdocs[i].photo = result.photo;
              chatdocs[i].aboutme = result.aboutme;
              chatdocs[i].dateonline = result.dateonline;
            }
          }
          return res.json({
            success: {
              data: [...chatdocs],
              message: `${chatdocs.length} Chat Conversations Found`,
              length: chatdocs.length
            }
          });
        }
      case 'chatids':
        {
          if (!from_user) {
            return res.status(403).json('Invalid Request!');
          }
          const chatdocs = await _models.Chat.find({
            'users._id': {
              $in: [from_user]
            },
            lastUpdated: {
              $gt: 0
            }
          }).select('users latestUpdate').sort({
            lastUpdated: -1
          });
          if (!chatdocs) {
            return res.json({
              success: {
                data: [],
                message: 'No Users Found'
              }
            });
          }
          return res.json({
            success: {
              data: [...chatdocs],
              message: `${chatdocs.length} Chat Conversations Found`,
              length: chatdocs.length
            }
          });
        }
      case 'username':
        {
          if (!from_user && !to_user) {
            return res.status(403).json('Invalid Request!');
          }
          const user = await _models.User.findOne({
            username: to_user
          }).select('username');
          if (!user) {
            return res.status(403).json('User Not Found!');
          }
          const chatdoc = await _models.Chat.findOne({
            'users._id': {
              $all: [from_user, user._id.toString()]
            },
            lastUpdated: {
              $gt: 0
            }
          }).select('users latestUpdate').sort({
            lastUpdated: -1
          });
          if (!chatdoc) {
            return res.json(null);
          }
          chatdoc.name = user.firstname + ' ' + user.lastname;
          chatdoc.username = user.username;
          chatdoc.photo = user.photo;
          chatdoc.aboutme = user.aboutme;
          chatdoc.dateonline = user.dateonline;
          return res.json(chatdoc);
        }
      default:
        return res.status(403).json('Invalid Request!');
    }
  } catch (error) {
    next(error);
  }
};
exports.getChatData = getChatData;
const sendChat = async (req, res, next) => {
  const {
    chatid,
    from_userid,
    to_username,
    message,
    photos
  } = req.body ? req.body : {};
  if (!(from_userid && (!chatid && to_username || chatid) && (message || photos))) {
    return res.status(403).json('Invalid Request!');
  }
  let chat = false;
  let senderdoc = null;
  let receiverdoc = null;
  try {
    if (!chatid) {
      senderdoc = await _models.User.findById(from_userid).select('username firstname lastname');
      receiverdoc = await _models.User.findOne({
        username: to_username
      }).select('username');
      if (!(senderdoc && receiverdoc && senderdoc.username !== receiverdoc.username)) {
        return res.status(500).json('Could not send message!');
      }
      chat = await initializeChat(senderdoc._id, receiverdoc._id);
    } else {
      chat = await _models.Chat.findById(chatid).where('users._id').all([from_userid]);
    }
    if (!chat) {
      return res.status(500).json('No conversation found!');
    }
    const datenow = new Date(Date.now());
    senderdoc = senderdoc ? senderdoc : await _models.User.findById(from_userid).select('username firstname lastname');
    receiverdoc = receiverdoc ? receiverdoc : await _models.User.findById(chat.users.filter(v => v._id.toString() !== from_userid)[0]._id.toString()).select('username');
    const prevConversation = chat.conversation;
    const conversationId = ObjectId();
    if (typeof message === "string") {
      // save normal message chat
      prevConversation.push({
        _id: conversationId,
        timestamp: datenow,
        senderid: senderdoc._id,
        message
      });
      chat.conversation = prevConversation;
      chat.latestUpdate = {
        timestamp: datenow,
        sendername: `${senderdoc.firstname} ${senderdoc.lastname}`,
        message: message.substring(0, message.length > 15 ? 15 : message.length) + (message.length > 15 ? '...' : '')
      };
      chat.lastUpdated = datenow.getTime();
      for (let i in chat.users) {
        chat.users[i].seenLatest = chat.users[i]._id.toString() === from_userid;
      }
    } else if (Array.isArray(photos) && photos.length > 0) {
      // save photos path instead
      prevConversation.push({
        _id: conversationId,
        timestamp: datenow,
        senderid: senderdoc._id,
        message: photos.length > 1 ? 'Sent photos' : 'Sent a photo',
        photos: [...photos]
      });
      chat.conversation = prevConversation;
      chat.latestUpdate = {
        timestamp: datenow,
        sendername: `${senderdoc.firstname} ${senderdoc.lastname}`,
        message: photos.length > 1 ? 'Sent photos' : 'Sent a photo'
      };
      chat.lastUpdated = datenow.getTime();
      for (let i in chat.users) {
        chat.users[i].seenLatest = chat.users[i]._id.toString() === from_userid;
      }
    } else {
      return res.json({
        error: {
          status: 500,
          statusCode: 500,
          message: 'Something went wrong. Please Try Again.'
        }
      });
    }
    // then save to database
    await chat.save();
    return res.json({
      success: {
        chatid: chat._id,
        message: 'Successfully Sent Chat!'
      }
    });
  } catch (error) {
    next(error);
  }
};
exports.sendChat = sendChat;