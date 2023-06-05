import './Checkbox.css'

export default function Checkbox(props) {
  const handleClick = (e) => {
    const children = [...e.target.children]
    if (children.length > 0)
      children[0].checked = !children[0].checked
  }
  return (
    <div className="checkbox-group" type="button" onClick={handleClick}><input type="checkbox" id={props.id} className={props.className} name={props.name} /> {props.label}</div>
    )
}