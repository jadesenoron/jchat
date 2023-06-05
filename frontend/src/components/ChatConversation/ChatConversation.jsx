import { useState, useEffect } from 'react'
import ChatMessageContent from "./ChatMessageContent";
import { getChatData, getChatConversation, getUserById, getUserByUsername } from '../../api';
import Swal from 'sweetalert2'

export default function ChatConversation({ chatid, userid, username }) {
  const [chat_id, setChatId] = useState(null)
  const [data, setData] = useState([])
  const [myUser, setMyUser] = useState(null)
  const [otherUser, setOtherUser] = useState(null)
  // const [messagesEnd, setMessagesEnd] = useState()

  const handleOpenPhotos = (photo, i, photos) => {
    console.log(photo, i, photos)
    console.log(photos)
    Swal.fire({
      width: '100%',
      height: '100%',
      background: '#030821be',
      html:`<img src="http://${window.location.hostname}:${process.env.NODE_ENV === 'development' ? '3080' : window.location.port}${photo}" class="img-thumbnail img-fluid" />`
    })
  }

  useEffect(() => {
    if (myUser === null && userid) {
        getUserById(userid)
        .then(resp => new Promise((res, rej)=>resp.data ? res(resp.data) : rej('Invalid chat data')))
        .then((myuserinfo) => setMyUser(myuserinfo))
        .catch(err => { setMyUser(null); console.log(err) })
    }
    if (otherUser === null && userid) {
      if (chatid) {
        getChatData(userid)
        .then(resp => new Promise(res=>res(resp.data)))
        .then(({success, error}) => new Promise((res, rej)=>
          success ? res(success.data.filter(v => v._id.toString() === chatid).pop()) : rej(error)
        ))
        .then(chatdata =>
          chatdata
          ? getUserById(chatdata.users.map(v => v._id).filter(uid => uid !== userid).pop() || '')
            .then(resp => new Promise(res=>res(resp.data)))
          : (function(){throw new Error('Invalid chat data')})()
        )
        .then(userinfo => setOtherUser(userinfo))
        .catch(err => { setOtherUser(null); console.log(err) })
      } else if (username){
        getUserByUsername(username)
        .then(resp => new Promise(res => res(resp.data)))
        .then(userinfo => setOtherUser(userinfo))
        .catch(err => { setOtherUser(null); console.log(err) })
      } else {
        setOtherUser(null)
      }
    }
  }, [chatid, userid, username, myUser, otherUser])

  useEffect(() => {
    if (chat_id === null && chatid && userid && myUser !== null && otherUser !== null) {
      getChatData(userid)
      .then(resp => new Promise(res=>res(resp.data)))
      .then(({success, error}) => new Promise((res, rej)=> success
        ? res(success.data.filter(v => v._id.toString() === chatid).length === 1)
        : rej(error)
      ))
      .then(isValid => isValid ? setChatId(chatid) : setChatId(null))
      .catch(error => { setChatId(null); console.log(error) } )
    } else if (chat_id === null && !chatid && myUser !== null && otherUser !== null) {
      getChatData(userid)
      .then(resp => new Promise(res=>res(resp.data)))
      .then(({success, error}) => new Promise((res, rej) => {
        if (success) {
          res(success.data.map(v =>
            v.users
            .map(v => v._id.toString() === myUser._id.toString() || v._id.toString() === otherUser._id.toString())
            .filter(v => v === true).length === 2 ? v._id.toString() : false)
          .filter(v => v !== false).join(''))
        } else {
          rej(error)
        }
      }))
      .then(cid => cid.length === 24 && setChatId(cid))
    }
  }, [chat_id, chatid, userid, myUser, otherUser])

  useEffect(() => {
    const func = async () => {
      if (chat_id && chat_id.length === 24) {
        // get the chat conversation data
        getChatConversation(chat_id, myUser._id.toString())
        .then(resp => new Promise(res=>res(resp.data)))
        .then(({success}) => {
          if (success && chat_id === success.chatid.toString()) {
            const newdata = success.data.reverse().map((v, i, dt) => {
                const isphotosnext = i < dt.length - 1 ? dt[i+1].photos.length > 0 : false
                const name = v.senderid.toString() === myUser._id.toString() ? `${myUser.firstname} ${myUser.lastname}` : (v.senderid.toString() === otherUser._id.toString() ? `${otherUser.firstname} ${otherUser.lastname}` : '')
                const profilephoto = v.senderid.toString() === myUser._id.toString() ? `http://${window.location.hostname}:${process.env.NODE_ENV === 'development' ? '3080' : window.location.port}${myUser.photo}` : (v.senderid.toString() === otherUser._id.toString() ? `http://${window.location.hostname}:${process.env.NODE_ENV === 'development' ? '3080' : ''}${otherUser.photo}` : window.location.port)
                const previous = i < dt.length - 1 ? v.senderid.toString() === dt[i+1].senderid.toString() && (v.photos.length === 0 || !isphotosnext) : false
                const right = v.senderid.toString() === myUser._id.toString()
                return {
                  name,
                  profilephoto,
                  previous,
                  right,
                  message: v.message,
                  time: new Date(v.timestamp),
                  photos: [...v.photos],
                  onClick: handleOpenPhotos,
                }
              }).reverse()
              if (newdata.length > data.length) {
                console.log("?")
                setData(newdata)
                // setTimeout(() => 
                // scrollToBottom(), 100)
              }
          } else {
            throw new Error('Invalid chat data')
          }
        })
        .catch(error => { setData([]); console.log(error) })
      } else {
        data.length > 0 && setData([])
      }
      // return setTimeout(func, 2000)
    }
    const interval = setInterval(func, 1000)
    func()
    // clearInterval(interval)
    return () => clearInterval(interval)
  }, [chat_id, data.length])

  // const scrollToBottom = () => {
    // messagesEnd.scrollIntoView({ behavior: "smooth", block: "end"});
  // }  

  return (<>
  {/* <div className="container-fluid overflow-auto d-flex flex-column-reverse" style={{minHeight: '100%', float:"left", clear: "both" }} ref={setMessagesEnd}> */}
    { data.length > 0
      ? data.map((v, i) => <ChatMessageContent key={`convo_${chat_id}_${i}`} {...v} />)
      : <div className="chat-conversation">
          <div className="no-conversation">No messages. Send a message to start chatting.</div>
        </div> }
  {/* </div> */}
  </>);
}