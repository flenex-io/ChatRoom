import React, { useRef, useState, useEffect } from 'react';
import './Style.css';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyCKgktPL918YYvtItVK3fi72biP1Kt1l8U",
  authDomain: "chatapp-8a965.firebaseapp.com",
  projectId: "chatapp-8a965",
  storageBucket: "chatapp-8a965.appspot.com",
  messagingSenderId: "232246837558",
  appId: "1:232246837558:web:0a10fe74e6952722923397",
  measurementId: "G-2W4Z4MGDM4"
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>FLX Chat Room</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const [displayName, setDisplayName] = useState('');

  const signInAnonymously = async (e) => {
    e.preventDefault();
    try {
      if (displayName.trim() !== '') {
        await auth.signInAnonymously();
        const currentUser = auth.currentUser;
        await currentUser.updateProfile({ displayName });
      } else {
        alert('Please enter a username');
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <h2 className="chat-heading">Once you're in the chatroom, you can still see past conversations</h2>
      <form onSubmit={signInAnonymously} className="form-container">
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Type your name here"
          className="username-input"
        />
        <button className="enter" type="submit">Enter Chat</button>
      </form>
    </>
  );
}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });
  const [formValue, setFormValue] = useState('');

  const { uid, displayName } = auth.currentUser;

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!formValue.trim()) {
      return;
    }

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      displayName,
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  useEffect(() => {
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="App">
      <section className="chat-section">
        <form onSubmit={sendMessage}>
          <input
            value={formValue}
            onChange={(e) => setFormValue(e.target.value)}
            placeholder="Type your message"
          />
        </form>

        <main>
          {messages && messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
          <span ref={dummy}></span>
        </main>
      </section>
    </div>
  );

}

function ChatMessage(props) {
  const { text, uid, displayName } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      <p className='displayname'>{`${displayName} -`}</p>
      <p className='messageText'>{text}</p>
    </div>
  );
}

export default App;