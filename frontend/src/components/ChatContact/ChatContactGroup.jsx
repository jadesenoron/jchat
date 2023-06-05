import { useState, useEffect } from 'react'
import ChatContact from './ChatContact'

export default function ChatContactGroup({ data=[], onSelect=console.log, initialSelectedIndex=-1 }) {
  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex)
  const [selectedData, setSelectedData] = useState(data instanceof Array ? data : [])

  useEffect(() => {
    setSelectedData(data instanceof Array ? data : [])
  }, [data]);

  useEffect(() => {
    setSelectedIndex(initialSelectedIndex)
  }, [initialSelectedIndex])

  const handleClick = ({ chatid, username, name, aboutme, isonline, index }) => {
    if (!chatid) {
      // use username instead
      setSelectedIndex(-1)
      onSelect({username, name, aboutme, isonline})
    } else {
      setSelectedIndex(index)
      onSelect({chatid, username, name, aboutme, isonline, index})
    }
  }
  return (<>
    { selectedData && selectedData.length > 0 ?
      selectedData.map((v, i) => <ChatContact key={`chat_contact_${i}`} data-index={i} selected={i === selectedIndex} chatid={v.chatid} username={v.username} name={v.name} time={v.time ? new Date(v.time) : undefined} message={v.message} profilephoto={v.profilephoto} isonline={v.isonline === true} aboutme={v.aboutme} onClick={() => handleClick({chatid: v.chatid, username: v.username, name: v.name, aboutme: v.aboutme, isonline: v.isonline === true, index: i})} {...v} />)
      : <div className="text-white d-flex justify-content-center align-items-center vh-100 h6">Search users to start chating.</div> }
  </>)
}
