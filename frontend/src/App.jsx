import { RouterProvider, createBrowserRouter, redirect } from 'react-router-dom'
import Swal from 'sweetalert2'
import Login from './components/Login/Login'
import Signup from './components/Signup/Signup'
import Chat from './components/Chat/Chat'
import { loginUser, uploadImage, signupUser, getUserById, getUserByUsername, getChatByUsername, getChatConversation, sendChatMessage } from './api'
import ChatConversationContainer from './components/ChatConversation/ChatConversationContainer'

const router = createBrowserRouter([
  {
    path: '/login',
    exact: true,
    element: <Login />,
    loader: () => {
      const logininfo = window.localStorage.getItem('logininfo')
      return !!logininfo ? redirect('/') : { }
    },
    action: async ({ request }) => {
      const formData = await request.formData()
      const { username, password } = Object.fromEntries(formData)
      try {
        const response = await loginUser(username, password)
        const { error, success } = response.data
        if (error) {
          // error message
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Invalid username or password',
            timer: 1000
          })
        } else {
          // successful login
          window.localStorage.setItem('logininfo', JSON.stringify({ userid: success.userid, expiresIn: Date.now() + (1000 * 60 * 60) /* 1 hour expiry */ }));
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Logged in successfully',
            timer: 1000
          }).then(() => {
            redirect('/')
          })
        }
      } catch (err) {
        console.log(err)
        // error message
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Something went wrong. Please try again',
          footer: `<strong class="text-danger">${err.message}</strong>`
        })
      }
      return !!window.localStorage.getItem('logininfo');
    }
  },
  {
    path: '/signup',
    exact: true,
    element: <Signup />,
    loader: () => {
      const logininfo = window.localStorage.getItem('logininfo')
      return !!logininfo ? redirect('/') : { }
    },
    action: async ({ request }) => {
      const frmData = await request.formData()
      const {
        username, password,
        firstname, middlename, lastname,
        birthday, gender, civilstatus,
        address, aboutme, photo,
        isvalidform
      } = Object.fromEntries(frmData)
      const isValidform = isvalidform ? JSON.parse(isvalidform) : { a: false }
      const isValid = Object.values(isValidform).every(v => v === true)
      if (isValid) {
        try {
          const aresp = await signupUser(username, password, firstname,
            middlename, lastname, birthday,
            gender, civilstatus, address,
            aboutme, photo)
          return aresp.data
        } catch (e) {
          return e.response.data
        }
      }
      return { error: { message: 'Invalid Details!' } }
    }
  },
  {
    path: '/logout',
    exact: true,
    loader: () => {
      window.localStorage.removeItem('logininfo')
      return redirect('/login')
    }
  },
  {
    path: '/',
    element: <Chat />,
    loader: async () => {
      const logininfo = window.localStorage.getItem('logininfo')
      return !logininfo ? redirect('/login') : { logininfo: JSON.parse(logininfo) }
    },
    children: [
      {
        index: true,
        element: <></>,
      },
      {
        path: '/chat/:chatid',
        element: <ChatConversationContainer />,
        loader: async ({ params }) => {
          const logininfo = window.localStorage.getItem('logininfo')
          try {
            if (logininfo && params.chatid) {
              const chatid = params.chatid
              const userid = JSON.parse(logininfo).userid
              const resp = await getChatConversation(chatid, userid)
              const { success } = resp.data
              if (success) {
                const otherid = success.users.filter(v => v._id.toString() !== userid).pop()._id.toString()
                const resp2 = await getUserById(otherid)
                const result2 = resp2.data
                if (result2) {
                  return {
                    chatid: success.chatid.toString(),
                    userid,
                    otherid: result2._id.toString(),
                    username: result2.username,
                    firstname: result2.firstname,
                    middlename: result2.middlename,
                    lastname: result2.lastname,
                    birthday: result2.birthday,
                    gender: result2.gender,
                    civilstatus: result2.civilstatus,
                    address: result2.address,
                    aboutme: result2.aboutme,
                    dateonline: result2.dateonline,
                    photo: result2.photo,
                    navlocation: 'chat'
                  }
                }
              }
            }
          } catch (err) {}
          return redirect('/')
        },
        action: async ({ request }) => {
          try {
            const fm = await request.formData()
            const data = Object.fromEntries(fm)
            if (data.message.length > 0) {
              const resp = await sendChatMessage(data)
              const { success } = resp.data
              return { success }
            }
          } catch (error) {
            return { error }
          }
          return { error: 'Invalid Message' }
        }
      },
      {
        path: '/chat/message/:username',
        element: <ChatConversationContainer />,
        loader: async ({ params }) => {
          const logininfo = window.localStorage.getItem('logininfo')
          try {
            if (logininfo && params.username) {
              const userid = JSON.parse(logininfo).userid
              const resp = await getUserByUsername(params.username)
              const result =  resp.data
              if (result) {
                const resp2 = await getChatByUsername(userid, result.username)
                const result2 = resp2.data
                if (result2) {
                  redirect('/chat/' + result2._id.toString())
                } else {
                  return {
                    userid,
                    otherid: result._id.toString(),
                    username: result.username,
                    firstname: result.firstname,
                    middlename: result.middlename,
                    lastname: result.lastname,
                    birthday: result.birthday,
                    gender: result.gender,
                    address: result.address,
                    aboutme: result.aboutme,
                    photo: result.photo,
                    dateonline: result.dateonline,
                    navlocation: 'message'
                  }
                }
              }
            }
          } catch (error) { }
          return redirect('/')
        },
        action: async ({ request }) => {
          try {
            const fm = await request.formData()
            const data = Object.fromEntries(fm)
            if (data.message.length > 0) {
              const resp = await sendChatMessage(data)
              const { success } = resp.data
              return redirect('/chat/' + success.chatid)
            }
          } catch (error) {
            return { error }
          }
          return { error: 'Invalid Message' }
        }
      }
    ]
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
