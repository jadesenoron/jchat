import axios from 'axios'

export const API_URL = {
    login: process.env.NODE_ENV === 'development'
            ? `http://${window.location.hostname}:3080/api/users/login`
            : '/api/users/login',
    signup: process.env.NODE_ENV === 'development'
            ? `http://${window.location.hostname}:3080/api/users`
            : '/api/users',
    exists: (username) => process.env.NODE_ENV === 'development'
            ? `http://${window.location.hostname}:3080/api/users?query=exists&username=${username}`
            : `/api/users?query=exists&username=${username}`,
    onlinestatus: (userid) => process.env.NODE_ENV === 'development'
                    ? `http://${window.location.hostname}:3080/api/users/${userid}/updateonlinestatus`
                    : `/${userid}/updateonlinestatus`,
    userById: (userid) => process.env.NODE_ENV === 'development'
                ? `http://${window.location.hostname}:3080/api/users?query=userid&userid=${userid}`
                : `/api/users?query=userid&userid=${userid}`,
    searchUser: (search) => process.env.NODE_ENV === 'development'
                ? `http://${window.location.hostname}:3080/api/users?query=search&search=${search}`
                : `/api/users?query=search&search=${search}`,
    searchUsername: (username) => process.env.NODE_ENV === 'development'
                ? `http://${window.location.hostname}:3080/api/users?query=profile&username=${username}`
                : `/api/users?query=profile&username=${username}`,
    update: (userid) => process.env.NODE_ENV === 'development'
            ? `http://${window.location.hostname}:3080/api/users/${userid}`
            : `/api/users/${userid}`,
    updatePassword: (userid) => process.env.NODE_ENV === 'development'
            ? `http://${window.location.hostname}:3080/api/users/${userid}/newpassword`
            : `/api/users/${userid}/newpassword`,
    verifyPass: (userid) => process.env.NODE_ENV === 'development'
                ? `http://${window.location.hostname}:3080/api/users/${userid}/verifypassword`
                : `/api/users/${userid}/verifypassword`,
    conversation: (chatid, userid) => process.env.NODE_ENV === 'development'
                ? `http://${window.location.hostname}:3080/api/chat?query=conversation&chatid=${chatid}&from_user=${userid}`
                : `/api/chat?query=conversation&chatid=${chatid}&from_user=${userid}`,
    searchChat: (userid, to_user_search) => process.env.NODE_ENV === 'development'
                ? `http://${window.location.hostname}:3080/api/chat?query=search&from_user=${userid}&to_user=${to_user_search}`
                : `/api/chat?query=search&from_user=${userid}&to_user=${to_user_search}`,
    chatUsername: (userid, username) => process.env.NODE_ENV === 'development'
                    ? `http://${window.location.hostname}:3080/api/chat?query=username&from_user=${userid}&to_user=${username}`
                    : `/api/chat?query=username&from_user=${userid}&to_user=${username}`,
    chatData: (userid) => process.env.NODE_ENV === 'development'
                ? `http://${window.location.hostname}:3080/api/chat?query=chatids&from_user=${userid}`
                : `/api/chat?query=chatids&from_user=${userid}`,
    sendChat: process.env.NODE_ENV === 'development'
                    ? `http://${window.location.hostname}:3080/api/chat`
                    : `/api/chat`,
    upload: process.env.NODE_ENV === 'development' ? `http://${window.location.hostname}:3080/api/uploadphoto` : '/api/uploadphoto',
}

export const loginUser = (username, password) => axios.post(API_URL.login, { username, password })

export const signupUser = (username, password, firstname, middlename, lastname, birthday, gender, civilstatus, address, aboutme, photo) => axios.post(API_URL.signup, { username, password, firstname, middlename, lastname, birthday, gender, civilstatus, address, aboutme, photo })

export const isUserExists = (username) => axios.get(API_URL.exists(username))

export const updateOnlineStatus = (userid) => axios.put(API_URL.onlinestatus(userid))

export const getUserById = (userid) => axios.get(API_URL.userById(userid))

export const getUsersBySearch = (search) => axios.get(API_URL.searchUser(search))

export const getUserByUsername = (username) => axios.get(API_URL.searchUsername(username))

export const updateUser = (userid, { firstname, middlename, lastname, birthday, gender, civilstatus, address, aboutme, photo }) => axios.put(API_URL.update(userid), { firstname, middlename, lastname, birthday, gender, civilstatus, address, aboutme, photo })

export const updateUserPassword = (userid, newpassword) => axios.put(API_URL.updatePassword(userid), { newpassword })

export const verifyUserPassword = (userid, oldpassword, newpassword) => axios.post(API_URL.verifyPass(userid), { oldpassword, newpassword })

export const getChatConversation = (chatid, userid) => axios.get(API_URL.conversation(chatid, userid))

export const getChatSearchData = (userid, to_user_search) => axios.get(API_URL.searchChat(userid, to_user_search))

export const getChatByUsername = (userid, username) => axios.get(API_URL.chatUsername(userid, username))

export const getChatData = (userid) => axios.get(API_URL.chatData(userid))

export const sendChatMessage = ({chatid, from_userid, to_username, message}) => axios.post(API_URL.sendChat, { chatid, from_userid, to_username, message })

export const sendChatPhoto = ({chatid, from_userid, to_username, photos=[]}) => axios.post(API_URL.sendChat, { chatid, from_userid, to_username, photos })

export const uploadImage = ({ formData, userid, file, files, filename, forProfile=false, onUploadProgress=(ev)=>{ console.log("EV", ev) } }) => {
    const data = formData ? formData : new FormData()
    if (!formData) {
        if (userid) { 
            data.append('userid', userid)
        }
        if (files) {
            files.forEach(v => {
                data.append('photo', v)
            })
        } else {
            data.append('photo', file, filename)
        }
        data.append('forProfile', !!forProfile)
    } else {
        data.delete('forProfile')
        data.append('forProfile', !!forProfile)
    }

    return axios.post(API_URL.upload, data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
        onUploadProgress
    })
}