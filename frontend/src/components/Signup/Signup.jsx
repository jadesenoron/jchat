import { useState, useEffect } from 'react'
import { Form, useActionData, useNavigate } from 'react-router-dom'
import './Signup.css'
import * as Icon from 'react-bootstrap-icons'
import defaultphoto from './default_photo.jpg'
import { isUserExists, uploadImage } from '../../api'
import Swal from 'sweetalert2'
// import Checkbox from '../Checkbox/Checkbox'

export default function Signup() {
  const action = useActionData()
  const navigate = useNavigate()

  useEffect(() => {
    if (action) {
      if (action.success) {
        Swal.fire({
          icon: 'success',
          title: 'Registered!',
          text: action.success.message,
          timer: 2000
        }).then(() => {
          navigate('/login', { redirect: true })
        })
      } else if (action.error) {
        Swal.fire({
          icon: 'error',
          title: 'Failed to Register!',
          text: action.error.message,
          timer: 2000
        })
      }
    }
    
  }, [action])
  
  const [inputs, setInputs] = useState({
    username: '',
    password: '',
    repeatpassword: '',
    firstname: '',
    middlename: '',
    lastname: '',
    birthday: '',
    gender: '',
    civilstatus: '',
    address: '',
    aboutme: '',
    photo: '/default-profile.jpg',
  })
  const [isInputValid, setInputValid] = useState({
    username: false,
    password: false,
    rpass: false
  })
  const [photoThumbnail, setPhotoThumbnail] = useState(defaultphoto)
  const [progressbar, setProgressbar] = useState()
  const [photouploader, setPhotoUploader] = useState()

  const setInputCallback = (e) => {
    switch (e.target.name) {
      case 'username': {
        setInputs(prev => Object.assign({}, {...prev, username: e.target.value}))
        validateInput(e.target)
        break
      }
      case 'password': {
        setInputs(prev => Object.assign({}, {...prev, password: e.target.value}))
        validateInput(e.target)
        break
      }
      case 'repeatpassword': {
        setInputs(prev => Object.assign({}, {...prev, repeatpassword: e.target.value}))
        validateInput(e.target)
        break
      }
      case 'firstname': {
        setInputs(prev => Object.assign({}, {...prev, firstname: e.target.value}))
        break
      }
      case 'middlename': {
        setInputs(prev => Object.assign({}, {...prev, middlename: e.target.value}))
        break
      }
      case 'lastname': {
        setInputs(prev => Object.assign({}, {...prev, lastname: e.target.value}))
        break
      }
      case 'birthday': {
        setInputs(prev => Object.assign({}, {...prev, birthday: e.target.value}))
        break
      }
      case 'gender': {
        setInputs(prev => Object.assign({}, {...prev, gender: e.target.value}))
        break
      }
      case 'civilstatus': {
        setInputs(prev => Object.assign({}, {...prev, civilstatus: e.target.value}))
        break
      }
      case 'address': {
        setInputs(prev => Object.assign({}, {...prev, address: e.target.value}))
        break
      }
      case 'aboutme': {
        setInputs(prev => Object.assign({}, {...prev, aboutme: e.target.value}))
        break
      }
      default:
        //skip
    }
  }

  const validateInput = (input) => {
    switch (input.name) {
      case 'username': {
        const validCheck = document.getElementById('username-valid');
        const invalidCheck = document.getElementById('username-invalid');
        if (input.value === '') {
          setInputValid(prev => Object.assign({}, {...prev, username: false}))
          if (![...validCheck.classList].includes('d-none')) {
            validCheck.classList.add('d-none')
          }
          if (![...invalidCheck.classList].includes('d-none')) {
            invalidCheck.classList.add('d-none')
          }
        } else {
          isUserExists(input.value).then(resp => {
            const result = resp.data;
            if (result) {
              setInputValid(prev => Object.assign({}, {...prev, username: false}))
              if (![...validCheck.classList].includes('d-none')) {
                validCheck.classList.add('d-none')
              }
              invalidCheck.classList.remove('d-none')
            } else {
              setInputValid(prev => Object.assign({}, {...prev, username: true}))
              if (![...invalidCheck.classList].includes('d-none')) {
                invalidCheck.classList.add('d-none')
              }
              validCheck.classList.remove('d-none')
            }
          })
          .catch(console.error)
        }
        break
      }
      case 'password': {
        const validCheck = document.getElementById('password-valid');
        const invalidCheck = document.getElementById('password-invalid');
        if (input.value === '') {
          setInputValid(prev => Object.assign({}, {...prev, password: false}))
          if (![...validCheck.classList].includes('d-none')) {
            validCheck.classList.add('d-none')
          }
          if (![...invalidCheck.classList].includes('d-none')) {
            invalidCheck.classList.add('d-none')
          }
        } else {
          if (input.value.length < 8) {
            setInputValid(prev => Object.assign({}, {...prev, password: false}))
            if (![...validCheck.classList].includes('d-none')) {
              validCheck.classList.add('d-none')
            }
            invalidCheck.classList.remove('d-none')
          } else {
            setInputValid(prev => Object.assign({}, {...prev, password: true}))
            if (![...invalidCheck.classList].includes('d-none')) {
              invalidCheck.classList.add('d-none')
            }
            validCheck.classList.remove('d-none')
          }
        }
        break
      }
      case 'repeatpassword': {
        const validCheck = document.getElementById('rpass-valid');
        const invalidCheck = document.getElementById('rpass-invalid');
        if (input.value === '') {
          setInputValid(prev => Object.assign({}, {...prev, rpass: false}))
          if (![...validCheck.classList].includes('d-none')) {
            validCheck.classList.add('d-none')
          }
          if (![...invalidCheck.classList].includes('d-none')) {
            invalidCheck.classList.add('d-none')
          }
        } else {
          const password = input.parentNode.parentNode.querySelector('input[name="password"]').value;
          const rpass = input.value;
          if (password !== rpass) {
            setInputValid(prev => Object.assign({}, {...prev, rpass: false}))
            if (![...validCheck.classList].includes('d-none')) {
              validCheck.classList.add('d-none')
            }
            invalidCheck.classList.remove('d-none')
          } else {
            setInputValid(prev => Object.assign({}, {...prev, rpass: true}))
            if (![...invalidCheck.classList].includes('d-none')) {
              invalidCheck.classList.add('d-none')
            }
            validCheck.classList.remove('d-none')
          }
        }
        break
      }
      default:
        // skip
    }
  }

  const handleUploadButton = (e) => photouploader.click()

  const handleFileUpload = (e) => {
    uploadImage({
      file: e.target.files[0],
      filename: e.target.value,
      forProfile: true,
      onUploadProgress: (ev) => {
        if (progressbar) {
          progressbar.parentNode.classList.remove('d-none')
          progressbar.style.width = `${Math.floor(ev.progress * 100)}%`
          // progressbar.innerHTML = `${Math.floor(ev.progress * 100)}%`
        }
      }
    })
    .then(resp => {
      if (progressbar) {
        progressbar.parentNode.classList.add('d-none')
      }
      const { success, error } = resp.data;
      if (error) {
        console.log(error)
        return
      }
      if (success) {
        setInputs(prev => Object.assign({}, {...prev, photo: success.files[0].filepath}))
        setPhotoThumbnail(success.files[0].filepath)
      }
    })
    .catch(err => {
      if (progressbar) {
        progressbar.classList.add('d-none')
      }
      console.error(err)
    })
  }
  return (
    <Form method="post">
      <div className="signup-container container-fluid">
        <div  className="signup-box shadow">
          <div className="row text-center justify-content-center align-items-center flex-column">
            <div className="col-12">
              <h2>Sign up!</h2>
            </div>
            <div className="col-12 text-secondary">
              Welcome to J's Chat.
            </div>
          </div>
          <div className="row w-100">
            <div className='col-6 text-center ps-5 pe-3'>
              <input type="hidden" name="isvalidform" value={JSON.stringify(isInputValid)} />
              <div className="signup-form">
                <label className="username" htmlFor="username">
                  <input type="text" name="username" placeholder="Username" onChange={setInputCallback} value={inputs.username} required />
                  <Icon.XCircleFill id="username-invalid" className="d-none" color="red" size={25} />
                  <Icon.CheckCircleFill id="username-valid" className="d-none" color="green" size={25} />
                </label>
                <label className="password" htmlFor="password">
                  <input type="password" name="password" placeholder="Password" onChange={setInputCallback} value={inputs.password} required/>
                  <Icon.XCircleFill id="password-invalid" className="d-none" color="red" size={25} />
                  <Icon.CheckCircleFill id="password-valid" className="d-none" color="green" size={25} />
                </label>
                <label className="repeatpassword" htmlFor="repeatpassword">
                  <input type="password" name="repeatpassword" placeholder="Repeat Password" onChange={setInputCallback} value={inputs.repeatpassword} required/>
                  <Icon.XCircleFill id="rpass-invalid" className="d-none" color="red" size={25} />
                  <Icon.CheckCircleFill id="rpass-valid" className="d-none" color="green" size={25} />
                </label>
              </div>
              <div className="form-group container">
                <img className="img-thumbnail" src={photoThumbnail} style={{width: '10em', height: '10em'}}alt='profile' />
                <input type="file" className="form-control visually-hidden" name="photoupload" ref={setPhotoUploader} onChange={handleFileUpload} />
                <input type="hidden" name="photo" value={inputs.photo} />
                <div className="progress mx-auto d-none" style={{ height: '0.3em', width: '12.5em'}} role="progressbar" aria-label="Upload Progress">
                  <div className="progress-bar bg-success" ref={setProgressbar} style={{width: '0%'}}></div>
                </div>
                <button className="btn text-white" type="button" onClick={handleUploadButton}><Icon.Upload color="skyblue" size={18} /> Upload Picture</button>
              </div>
            </div>
            <div className='col-6 text-center ps-3 pe-5'>
              <div className="signup-form">
                <label className="firstname" htmlFor="firstname">
                  <input type="text" name="firstname" placeholder="First Name" required />
                </label>
                <label className="middlename" htmlFor="middlename">
                  <input type="text" name="middlename" placeholder="Middle Name" />
                </label>
                <label className="lastname" htmlFor="lastname">
                  <input type="text" name="lastname" placeholder="Last Name" required />
                </label>
                {/* <!-- Birthday --> */}
                <label className="birthday" htmlFor="birthday">
                  <input type="date" name="birthday" placeholder="Birthday" required />
                </label>
                {/* <!-- Gender --> */}
                <label className="gender" htmlFor="gender">
                  <select name="gender" placeholder='Gender'>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </label>
                {/* <!-- Civil Status --> */}
                <label className="civilstatus" htmlFor="civilstatus">
                  <select name="civilstatus" placeholder='Civil Status'>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </label>
                <label className="address" htmlFor="address">
                  <input type="text" name="address" placeholder="Address" />
                </label>
                <label className="aboutme" htmlFor="aboutme">
                  <input type="text" name="aboutme" placeholder="About Me" />
                </label>
              </div>
            </div>
          </div>
          <div className='row text-center justify-content-center align-items-center'>
            <div className='col-12'>
              <div className='form-group w-50 my-3 mx-auto'>
                <button className="signup-button">Sign up</button>
              </div>
            </div>
            <div className='col-12'>
              <div className="login-content">
                Already have an account? <a href="/login">Login here!</a>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </Form>
  )
}
