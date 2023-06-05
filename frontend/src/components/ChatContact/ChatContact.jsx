import './ChatContact.css'

export default function ChatContact({ chatid='', username='', name='', profilephoto=`http://${window.location.hostname}:${process.env.NODE_ENV === 'development' ? '3080' : window.location.port}/default-profile.jpg`, time=new Date(), message='', aboutme='', isonline=false, selected=false, onClick=(e) => { console.log(chatid, e) }, ...props}) {

  return (<>
    <div className={`chat-contact${selected ? ' selected' : ''}${isonline ? ' online' : ''}`}>
      <img className="img-thumbnail img-fluid" src={profilephoto} style={{width: '2.5em', height: '2.5em'}} alt={name} />
      <div className='chat-contact-details'>
        <div className="contact-name">
          <div>{name.length > 18 ? name.substring(0, 15) + ' ..' : name}</div>
          { chatid
            ? <span>{time.getHours() > 12 ? time.getHours()-12 : time.getHours()}:{time.getMinutes() < 10 ? `0${time.getMinutes()}` : time.getMinutes()} {time.getHours() > 11 ? 'am' : 'pm'}</span>
            : undefined }
        </div>
        <div className="contact-message">
          { chatid
            ? (message.length > 28 ? message.substring(0, 25) + '...' :  (message.length < 28 ? message : message + '...'))
            : aboutme }
        </div>
      </div>
      <button type="button" className="contact-button-transparent" onClick={onClick} {...props} />
    </div>
  </>)
}
