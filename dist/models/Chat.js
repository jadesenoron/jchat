"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _mongoose = require("mongoose");
const ChatSchema = new _mongoose.Schema({
  users: {
    type: [{
      _id: {
        type: _mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
      },
      seenLatest: {
        type: Boolean,
        default: false
      }
    }],
    unique: true,
    validate: [val => val.length === 2, '{PATH} exceeds the limit of 10']
  },
  conversation: {
    type: [{
      _id: {
        type: _mongoose.Schema.Types.ObjectId,
        required: true
      },
      timestamp: {
        type: Date,
        required: true
      },
      message: {
        type: String,
        required: true
      },
      senderid: {
        type: _mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
      },
      photos: {
        type: Array,
        default: []
      }
    }],
    default: []
  },
  latestUpdate: {
    timestamp: {
      type: Date
    },
    sendername: {
      type: String
    },
    message: {
      type: String
    }
  },
  lastUpdated: {
    type: Number,
    required: true
  }
});
const Chat = (0, _mongoose.model)('Chat', ChatSchema);
var _default = Chat;
exports.default = _default;