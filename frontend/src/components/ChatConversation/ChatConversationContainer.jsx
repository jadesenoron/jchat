import { useState, useEffect } from 'react'
import { useLoaderData, useActionData, Form, useNavigation } from 'react-router-dom'
import * as Icons from 'react-bootstrap-icons'
import ChatConversation from './ChatConversation'
import './ChatConversationContainer.css'
import { sendChatPhoto, uploadImage } from '../../api'

export default function ChatConversationContainer() {
  const navigation = useNavigation()
  const { chatid, userid, otherid, username,
          firstname, middlename, lastname,
          birthday, gender, civilstatus,
          address, aboutme, dateonline,
          photo, navlocation } = useLoaderData()
  const actionData = useActionData()

  const [photoUploader, setPhotoUploader] = useState()
  const [submiForm, setSubmitForm] = useState()
  const [messageContent, setMessageContent] = useState('')
  const [isOnline, setIsOnline] = useState(false)
  const [selectedConversation, setUserConversation] = useState({
    chatid,
    otherid,
    userid,
    username,
    firstname,
    middlename,
    lastname,
    birthday,
    gender,
    civilstatus,
    address,
    aboutme,
    photo,
    navlocation,
  });

  useEffect(() => {
    const now = Date.now()
    const timeonline = (new Date(dateonline).getTime()) + (1000 * 60 * 10)
    setIsOnline(timeonline > now)
    const tmp = { chatid, userid, username }
    if (selectedConversation.chatid !== chatid || selectedConversation.userid !== userid || selectedConversation.username !== username) {
      setUserConversation(tmp)
    }
  }, [isOnline, dateonline, chatid, userid, username, selectedConversation.chatid, selectedConversation.userid, selectedConversation.username])
  
  useEffect(() => {
    if (actionData && actionData.success && navigation.state === 'submitting') {
      setMessageContent('')
    }
  }, [messageContent, actionData])

  const handleUploader = (e) => {
    uploadImage({
      files: [...e.target.files],
      forProfile: false,
      userid,
      onUploadProgress: () => {
        if (submiForm) {
          submiForm.setAttribute('disabled', 'true')
        }
      }
    })
    .then(resp => new Promise((res, rej) =>{
      if (submiForm) {
        submiForm.setAttribute('disabled', 'false')
      }
      const { success, error } = resp.data;
      if (error) {
        rej(error)
      }
      if (success) {
        res(success.files.map(f => f.filepath))
      }
    }))
    .then(photos => new Promise((res, rej) => {
      const frmData = new FormData(submiForm)
      const { from_userid, to_username } = Object.fromEntries(frmData)
      sendChatPhoto({from_userid, to_username, photos})
      .then(resp => res(resp.data))
      .catch(rej)
    }))
    .then(({error, success}) => {
      if (error) {
        console.log(error);
        return
      }
      if (success) {
        console.log('send photos successfully')
      }
    })
    .catch(error => {
      console.log(error)
      if (submiForm) {
        submiForm.setAttribute('disabled', 'false')
      }
    })
  }

  return (<>
    <div className="container-fluid overflow-auto col-chat pt-3">
      <div className="row justify-content-between mb-3">
        <div className="col-auto">
          <div className={`profile-info-self${isOnline ? ' online' : ''}`}>
            <img className="img-thumbnail img-fluid" src={`http://${window.location.hostname}:${process.env.NODE_ENV === 'development' ? '3080' : window.location.port}${photo}`} style={{width: '2.5em', height: '2.5em'}} alt="Neil Jason Canete" />
            <div className="profile-info-name">
              {firstname + " " + lastname}
              <span className="opacity-50 text-white">{aboutme}</span>
            </div>
          </div>
        </div>
        <div className="col-4 d-flex justify-content-end align-items-center px-4 d-none d-md-flex d-lg-flex d-xl-flex d-xxl-flex">
          <Icons.Telephone className='me-3'/>
          <Icons.PersonAdd />
        </div>
      </div>
      <div className="chat-convo-container" >
        <div className="conversation-container d-flex flex-column-reverse" >
          <ChatConversation {...selectedConversation} />
        </div>
        <form encType="multipart/form-data">
          <input type="file" onChange={handleUploader} accept="image/png, image/gif, image/jpeg" multiple name="photos" className="visually-hidden" ref={setPhotoUploader} />
        </form>
        <Form method="post" ref={setSubmitForm} onSubmit={() => { setMessageContent('')}}className="send-message-container">
          <button type="button" onClick={() => photoUploader.click()} className="btn btn-outline-none text-white d-none d-md-block d-lg-block d-xl-block d-xxl-block" style={{fontSize: '5mm'}}>
            <Icons.Images />
          </button>
          <input type="hidden" name="chatid" value={chatid} />
          <input type="hidden" name="from_userid" value={userid} />
          <input type="hidden" name="to_username" value={username} />
          <textarea type="text" name="message" value={messageContent} onChange={(e) => setMessageContent(e.target.value)}className="form-control mx-3 mt-3 rounded-4 text-white" placeholder='Type your Message...' />
          <button type="submit" className="btn btn-outline-none text-warning">
            <Icons.Send style={{transform: 'rotate(45deg)', fontSize: '7mm'}} />
          </button>
        </Form>
      </div>
    </div>
  </>)
}