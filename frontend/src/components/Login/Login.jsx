import { Form } from 'react-router-dom'
import './Login.css'
import Checkbox from '../Checkbox/Checkbox'

export default function Login() {
  return (
    <Form method="post">
      <div className="login-container">
        <div  className="login-box shadow">
          <h2>Log in!</h2>
          <div className="text-secondary">Welcome to J's Chat.</div>
          <div className="login-form">
            <label className="username" htmlFor="username">
              <span></span>
              <input type="text" name="username" placeholder="Username" required />
            </label>
            <label className="password" htmlFor="password">
              <span></span>
              <input type="password" name="password" placeholder="Password" required/>
            </label>
            <Checkbox name="rememberme" label="Remember me" />
            <button className="login-button">Log in</button>
          </div>
          <div className="register-content">
            New user? <a href="/signup">Register here!</a>
          </div>
        </div>
      </div>
    </Form>
  )
}
