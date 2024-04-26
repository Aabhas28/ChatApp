"use client";

import { useState, useEffect, useRef } from "react";
import Loader from "./Loader";
import Link from "next/link";
import { AddPhotoAlternate } from "@mui/icons-material";
import { CldUploadButton } from "next-cloudinary";
import { useSession } from "next-auth/react";
import MessageBox from "@/components/MessageBox";
import { pusherClient } from "@/lib/pusher";



const ChatDetails = ({chatId}) => {
    const [loading, setLoading] = useState(true);
  const [chat, setChat] = useState({});
  const [otherMembers, setOtherMembers] = useState([]);

  const { data: session } = useSession();
  const currentUser = session?.user;

  const [text, setText] = useState("");

  

  const getChatDetails = async () => {
    try {
        const res = await fetch(`/api/chats/${chatId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
      });
      const data = await res.json();
      setChat(data);
      setOtherMembers(
        data?.members?.filter((member) => member._id !== currentUser._id)
      );
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (currentUser && chatId) getChatDetails();
  }, [currentUser, chatId]);

  const sendText = async () => {
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId,
          currentUserId: currentUser._id,
          text,
        }),
      });

      if (res.ok) {
        setText("");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const sendPhoto = async (result) => {
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId,
          currentUserId: currentUser._id,
          photo: result?.info?.secure_url,
        }),
      });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    pusherClient.subscribe(chatId);

    const handleMessage = async (newMessage) => {
      setChat((prevChat) => {
        return {
          ...prevChat,
          messages: [...prevChat.messages, newMessage],
        };
      });
    };

    pusherClient.bind("new-message", handleMessage);

    return () => {
      pusherClient.unsubscribe(chatId);
      pusherClient.unbind("new-message", handleMessage);
    };
  }, [chatId]);

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [chat?.messages]);

  

  return loading ? (
    <Loader />
  ) : (
    <div className="pb-20">
      <div className="chat-details">
        <div className="chat-header">
          {chat?.isGroup ? (
            <>
              <Link href={`/chats/${chatId}/group-info`}>
                <img
                  src={chat?.groupPhoto || "data:image/jpeg;base64,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"}
                  alt="group-photo"
                  className="profilePhoto"
                />
              </Link>

              <div className="text">
                <p>
                  {chat?.name} &#160; &#183; &#160; {chat?.members?.length}{" "}
                  members
                </p>
              </div>
            </>
          ) : (
            <>
              <img
                src={"data:image/jpeg;base64,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"}
                alt="profile photo"
                className="profilePhoto"
              />
              <div className="text">
              <p>{otherMembers[0].username}</p>
              </div>
            </>
          )}
        </div>
        <div className="chat-body">
        {chat?.messages?.map((message, index) => (
            <MessageBox
              key={index}
              message={message}
              currentUser={currentUser}
            />
          ))}
          <div ref={bottomRef} />
        </div>
        <div className="send-message">
          <div className="prepare-message">
            
          <CldUploadButton
              options={{ maxFiles: 1 }}
              onSuccess={sendPhoto}
              uploadPreset="akccb9gd"
            >
              <AddPhotoAlternate
                sx={{
                  fontSize: "35px",
                  color: "#737373",
                  cursor: "pointer",
                  "&:hover": { color: "red" },
                }}
              />
            </CldUploadButton>

            <input
              type="text"
              placeholder="Write a message..."
              className="input-field"
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
            />
          </div>

          <div onClick={sendText}>
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAMAAABC4vDmAAAAaVBMVEX///8AAAD5+fl3d3f8/Pz09PTx8fHn5+cEBATQ0NB0dHRQUFAgICAvLy9YWFjq6uqSkpKhoaGLi4ve3t6+vr6EhIQ/Pz+1tbVtbW3FxcVISEgpKSkMDAynp6cSEhJdXV1lZWU2NjYZGRlXuuPKAAADL0lEQVR4nO2b6XaqMBCASRiWiCxhEVBxe/+HvElAi4pgzy1JfszXc4Sqha+TMRMSdBwEQRAEQRAEQRAEQRAEQRAEQf4KMC3wDPRGdllBXVK1NS0yhjYk6gKrlISUSwiJK9b/ZomckiJkuy89W5QeUtIrYzK7bDC7S4UhIQe3pVZJDcS8MG3kvEmNkt5gzN6kBAlXfQSAKa8pKUL2udFWnJYS7FrfPilCImNJPyMl+ojNEC7Qm1wzUqFqxTrVbzUbKYXoI6jm/mFZSnCpA51O30mR4y4baa0ete+kJI0YRzigftbWUlLhgk/Yv+HcaUp6MfL8ilCZbxvm6bBi3N1vl5XuD6dzR9dWGvBYzfMm2sW3L4J2ywoRrrXzaji8lwas5JmbPAVuKt9ilfQaPoY/J6B+UNT5JdrHp8/ZddVUGF//b69oS16d39zusataT4vXuyNQGrC6y5roej28ZNwx6a8YNZagl1OJuOXJcZRiau/Qmhg2g+enRZltkmh33Y7aUSlds0JX/6CQ2S77CTc6TGcUuV1qfTkFQVt3uZvsrofj516B5K03tNyKzecHrC27KoqPUwqj3kAqJnzdAbxsp5K7TbL7ojfvK/N57WsKWs1EZiJUZK96zXU/cXTzkzPh0hBGDtmD1ZV+M8gTPcCmLy1rp/ey1CN6e65toP5lpG6XUmOhW5JSgYozNROjrZ4sR+p47nxHw9XCL6SOuYEByrzUycwcxwcpmUqHpjRh9FlKBClnw8WnNVJRf91piJGUHAH0lSZhvtEJ9XGklFEYDXMZVkj19SRRk2SaZ+4+S5FHxQVD+T0lZW7i9RUppeZTNjor7gJ9pIYVLFsQI89TJJMbtJbceWjuWhUkBaT2pNIDixptjI1OCIIgCIIgCIIgCIIgCIIgCIIgCILMAM+PcL8/4v71ORi+ndyvLMN4sRJej/MnC4bqJAHv9wMnoEpJHvp+I7e8texpzRTUMnNBKSvExneo3IDXpg5j8gkQzxftf61Fg+N5RQWUAvVzWqXgU+oJoPLFrngxS4UoiCd8D+QL/R/V57TlGQsy36ldp4hSXueMZ62X+63Yyzo+f9p/pFchXwj92RUAAAAASUVORK5CYII=" alt="send" className="send-icon" />
          </div>
        </div>
    </div>
    </div>
  )
}

export default ChatDetails
