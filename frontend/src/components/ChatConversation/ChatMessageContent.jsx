import './ChatConversation.css'

export default function ChatMessageContent({ name='', profilephoto=`http://${window.location.hostname}:${process.env.NODE_ENV === 'development' ? '3080' : window.location.port}/default-profile.jpg`, message='', time=new Date(), previous=false, right=false, photos=[], onClick=()=>{}, ...props }) {
  const handlePhotos = (i) => {
    onClick(photos[i], i, photos);
  }
  return (<>
    <div className={`chat-conversation${right ? ' right' : ''}`} {...props}>
      <div className={`chat-message${previous ? ' previous' : ''}`}>
        { !previous
          ? <img className="img-thumbnail" src={profilephoto} style={{width: '2em', height: '2em'}} alt={name} />
          : undefined }
        { photos.length === 0
          ? <div className="bubble-chat-message">
          {message.trim().split('\n').map(v => <>{v}<span style={{whiteSpace: 'pre-line'}}></span></>)}
          </div>
          : <div className="photos-container mx-4 px-3">{photos.length > 0 ? Array.from({ length: Math.min(photos.length, 4) }).fill(false).map((_, i) => <div key={`photoschat_${i}`} type="button" className="photo-gallery border border-dark border-2" alt="Sent photos" style={{backgroundImage: `url(http://${window.location.hostname}:${process.env.NODE_ENV === 'development' ? '3080' : window.location.port}/${photos[i]})`}} onClick={() => handlePhotos(i)}></div>) : undefined}</div> }
      </div>
      { !previous ?
        <div className="chat-time">
          {time.getHours() > 12 ? time.getHours()-12 : time.getHours()}:{time.getMinutes() < 10 ? `0${time.getMinutes()}` : time.getMinutes()} {time.getHours() < 12 ? 'am' : 'pm'}
        </div>
        : undefined }
    </div>
  </>);
}
