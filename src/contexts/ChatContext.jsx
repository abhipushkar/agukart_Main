"use client";
import React, { useEffect, useState, createContext } from "react";
// import { db } from "../../../src/firebase/Firebase";
import { db } from "../../src/firebase/Firebase";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
// import useMyProvider from "hooks/useMyProvider";
import useMyProvider from "hooks/useMyProvider";
import { getAPIAuth, postAPIAuth } from "utils/__api__/ApiServies";

import { usePathname } from "next/navigation";
import useAuth from "hooks/useAuth";
import { filter } from "lodash";

export const ChatContext = createContext(null);

const ChatContextProvider = ({ children }) => {
  const { usercredentials } = useMyProvider();

  const pathname = usePathname();

  const [checkMessage, setCheckMessage] = useState([]);
  const [showCount, setShowCount] = useState(0);
  const [chats, setChats] = useState([]);

  const [etsyCount, setEtsyCount] = useState(0);
  const [vendorDetails, setVendorDetails] = useState([]);
  const [allChecked, setAllChecked] = useState(false);
  const [etsyMsgIds, setEtsyMsgIds] = useState([]);
  const [searchText, setSearchText] = useState("");
  const { token } = useAuth();

  const handleCheckboxChange = (event, id) => {
    if (event.target.checked) {
      setCheckMessage([...checkMessage, id]);
    } else {
      setCheckMessage(checkMessage.filter((rowId) => rowId !== id));
    }
  };

  const moveToChatHandler = () => {
    if (!checkMessage.length) {
      return;
    }

    checkMessage.map(async (docId) => {
      try {
        const docRef = doc(
          db,
          pathname === "/messages/etsy" ? "composeChat" : "chatRooms",
          docId,
        );
        await updateDoc(docRef, {
          isTempDelete1: "",
        });
        setCheckMessage([]);
        setAllChecked(false);
      } catch (error) {
        console.error("Error updating document: ", error);
      }
    });
  };
  const moveToTrashHandler = () => {
    if (!checkMessage.length) {
      return;
    }

    checkMessage.map(async (docId) => {
      try {
        const docRef = doc(
          db,
          pathname === "/messages/etsy" ? "composeChat" : "chatRooms",
          docId,
        );
        await updateDoc(docRef, {
          isTempDelete1: usercredentials?._id,
        });
        setCheckMessage([]);
        setAllChecked(false);
      } catch (error) {
        console.error("Error updating document: ", error);
      }
    });
  };

  const permanentDeleteHandler = () => {
    checkMessage.map(async (docId) => {
      try {
        const docRef = doc(
          db,
          pathname === "/messages/etsy" ? "composeChat" : "chatRooms",
          docId,
        );
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const myDoc = docSnap.data(); // Return the document data

          const updateArr = myDoc.text.map((msg) => {
            return { ...msg, permanentDeleteUser: usercredentials?._id };
          });

          await updateDoc(
            doc(
              db,
              pathname === "/messages/etsy" ? "composeChat" : "chatRooms",
              docId,
            ),
            {
              permanentDeleteUser1: usercredentials?._id,
              text: updateArr,
            },
          );
        }
        setCheckMessage([]);
        setAllChecked(false);
      } catch (error) {
        console.error("Error getting document:", error);
        throw error; // Handle the error as needed
      }
    });
  };

  const markAsUnreadHandler = () => {
    checkMessage.map(async (docId) => {
      try {
        const docRef = doc(
          db,
          pathname === "/messages/etsy" ? "composeChat" : "chatRooms",
          docId,
        );
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const myDoc = docSnap.data();

          const updateArr = myDoc.text.map((msg) => {
            if (msg.messageSenderId !== usercredentials?._id) {
              return { ...msg, isNotification: false };
            }
            return msg;
          });

          await updateDoc(
            doc(
              db,
              pathname === "/messages/etsy" ? "composeChat" : "chatRooms",
              docId,
            ),
            {
              text: updateArr,
            },
          );
        }
        setCheckMessage([]);
        setAllChecked(false);
      } catch (error) {
        console.error("Error getting document:", error);
        throw error; // Handle the error as needed
      }
    });
  };
  const markAsReadHandler = () => {
    checkMessage.map(async (docId) => {
      try {
        const docRef = doc(
          db,
          pathname === "/messages/etsy" ? "composeChat" : "chatRooms",
          docId,
        );
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const myDoc = docSnap.data();

          const updateArr = myDoc.text.map((msg) => {
            if (msg.messageSenderId !== usercredentials?._id) {
              return { ...msg, isNotification: true };
            }
            return msg;
          });

          await updateDoc(
            doc(
              db,
              pathname === "/messages/etsy" ? "composeChat" : "chatRooms",
              docId,
            ),
            {
              text: updateArr,
            },
          );
        }
        setCheckMessage([]);
        setAllChecked(false);
      } catch (error) {
        console.error("Error getting document:", error);
        throw error; // Handle the error as needed
      }
    });
  };

  const parseUserCreatedAt = (value) => {
    if (!value) return null;

    // 1️⃣ Firestore Timestamp
    if (typeof value === "object" && typeof value.toDate === "function") {
      return value.toDate();
    }

    // 2️⃣ Already a Date object
    if (value instanceof Date) {
      return isNaN(value.getTime()) ? null : value;
    }

    // 3️⃣ ISO string (contains T → safest check)
    if (typeof value === "string" && value.includes("T")) {
      const d = new Date(value);
      return isNaN(d.getTime()) ? null : d;
    }

    // 4️⃣ Custom format: DD-MM-YYYY HH:mm:ss
    if (typeof value === "string" && value.includes("-")) {
      const [datePart, timePart] = value.split(" ");
      if (!datePart || !timePart) return null;

      const [dd, mm, yyyy] = datePart.split("-");
      if (!dd || !mm || !yyyy) return null;

      const d = new Date(`${yyyy}-${mm}-${dd}T${timePart}`);
      return isNaN(d.getTime()) ? null : d;
    }

    return null;
  };

  const isAudienceAllowed = (item, userCreatedAt) => {
    if (!item.audienceMode || !item.userCreatedBefore) return false;

    const cutoff = item.userCreatedBefore.toDate();

    if (item.audienceMode === "snapshot") {
      // old users only
      return userCreatedAt <= cutoff;
    }

    if (item.audienceMode === "persistent") {
      // new users only
      return userCreatedAt > cutoff;
    }

    return false;
  };

  const isSpreadAllowed = (item, userCreatedAt) => {
    if (!item.isSpreadStopped) return true;

    if (!item.spreadStoppedAt) return false;

    return userCreatedAt <= item.spreadStoppedAt.toDate();
  };

  useEffect(() => {
    if (searchText) return;
    setCheckMessage([]);
    const q = query(
      collection(
        db,
        pathname === "/messages/etsy" ? "composeChat" : "chatRooms",
      ),
      orderBy("currentTime", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot?.docs?.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const vendorIds = newMessages.map((chat) => chat.receiverId);
      getVendorDetails(vendorIds);

      let matchingDocument = newMessages?.filter((doc) => {
        return doc?.user === usercredentials?._id;
      });

      if (pathname === "/messages/pin") {
        const filterPinned = matchingDocument.filter((doc) => {
          return (
            doc.pinnedMsgUser === usercredentials?._id &&
            doc.isTempDelete1 !== usercredentials?._id
          );
        });
        setChats(filterPinned);
        return;
      }

      if (pathname === "/messages") {
        const isDeletefilterData = matchingDocument.filter(
          (item) => item.isTempDelete1 !== usercredentials?._id,
        );
        setChats(isDeletefilterData);
        return;
      }
      if (pathname === "/messages/etsy") {
        const userCreatedAt = parseUserCreatedAt(usercredentials?.createdAt);

        const filterData = newMessages.filter((item) => {
          if (item.type !== "allusers") return false;
          if (!userCreatedAt) return false;

          return (
            isAudienceAllowed(item, userCreatedAt) &&
            isSpreadAllowed(item, userCreatedAt)
          );
        });

        setChats(filterData);
        return;
      }

      if (pathname === "/messages/inbox") {
        const isDeletefilterData = matchingDocument.filter(
          (item) => item.isTempDelete1 !== usercredentials?._id,
        );

        const filteredData = isDeletefilterData?.filter((item) =>
          item.text.some((msg) => msg.messageSenderId !== usercredentials?._id),
        );
        setChats(filteredData);
        return;
      }

      if (pathname === "/messages/sent") {
        const isDeletefilterData = matchingDocument.filter(
          (item) => item.isTempDelete1 !== usercredentials?._id,
        );
        setChats(isDeletefilterData);
        return;
      }

      if (pathname === "/messages/unread") {
        const filteredData = matchingDocument?.filter((item) =>
          item.text.some(
            (msg) =>
              msg.messageSenderId !== usercredentials?._id &&
              msg?.isNotification === false,
          ),
        );
        setChats(filteredData);
        return;
      }

      if (pathname === "/messages/trash") {
        const isDeletefilterData = matchingDocument.filter(
          (item) => item.isTempDelete1 === usercredentials?._id,
        );
        setChats(isDeletefilterData);
      }
    });

    return () => unsubscribe();
  }, [usercredentials?._id, pathname, searchText]);

  useEffect(() => {
    setSearchText("");
  }, [pathname]);

  const getVendorDetails = async (vendorIds) => {
    try {
      const res = await postAPIAuth("getVendorDetails", {
        vendorId: vendorIds,
      });
      setVendorDetails(res?.data?.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getSingleVendorDetails = async (id) => {
    try {
      const res = await postAPIAuth("getVendorDetails", {
        vendorId: [id],
      });
      return res?.data?.data[0];
    } catch (error) {
      console.log(error);
    }
  };

  // track real time unread chat count

  useEffect(() => {
    const composeChatQuery = query(
      collection(db, "composeChat"),
      orderBy("currentTime", "desc"),
    );

    const chatRoomsQuery = query(
      collection(db, "chatRooms"),
      orderBy("currentTime", "desc"),
    );

    const getUnreadCounts = async () => {
      let composeChatUnreadCount = 0;
      let chatRoomsUnreadCount = 0;

      // Fetch and calculate unread messages for composeChat (Etsy route)
      const unsubscribeComposeChat = onSnapshot(
        composeChatQuery,
        (snapshot) => {
          const newMessages = snapshot?.docs
            ?.filter((item) => {
              if (item.type !== "allusers") return false;
              if (!userCreatedAt) return false;

              return (
                isAudienceAllowed(item, userCreatedAt) &&
                isSpreadAllowed(item, userCreatedAt)
              );
            })
            ?.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
          let filterArr = [];

          newMessages.forEach((msg) => {
            if (etsyMsgIds?.includes(msg.id)) {
              filterArr.push(msg);
            }
          });
          setEtsyCount(newMessages.length - filterArr.length);
        },
      );

      // Fetch and calculate unread messages for chatRooms (other routes)
      const unsubscribeChatRooms = onSnapshot(chatRoomsQuery, (snapshot) => {
        const newMessages = snapshot?.docs?.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const filtersDocs = newMessages.filter((doc) => {
          return doc?.user === usercredentials?._id;
        });

        const unreadMessages = filtersDocs.filter((parent) =>
          parent?.text?.some(
            (notification) =>
              !notification?.isNotification &&
              notification.messageSenderId !== usercredentials?._id,
          ),
        );

        chatRoomsUnreadCount = unreadMessages.length;
        setShowCount(chatRoomsUnreadCount);
      });

      return () => {
        unsubscribeComposeChat();
        unsubscribeChatRooms();
      };
    };

    getUnreadCounts();
  }, [usercredentials?._id, etsyMsgIds]);

  useEffect(() => {
    if (checkMessage.length === chats.length) {
      setAllChecked(true);
      return;
    }
    if (checkMessage.length !== chats.length) {
      setAllChecked(false);
      return;
    }
  }, [checkMessage, chats]);

  // get messageids from node for etsy

  const getMessageId = async () => {
    try {
      const res = await getAPIAuth(`/user/getMessageId`, token);
      if (res.status === 200) {
        setEtsyMsgIds(res.data.senderMessage.message_id);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (token) {
      getMessageId();
    }
  }, [token]);

  const sendEtsyIdsHandler = async (arr) => {
    try {
      const res = await postAPIAuth(
        `/user/sendMessageID`,
        {
          message_id: arr,
        },
        token,
      );
      if (res.status === 200) {
        getMessageId();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const pinnedMessageHadler = async (docId) => {
    try {
      const docRef = doc(db, "chatRooms", docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const docData = docSnap.data();
        if (docData?.pinnedMsgUser) {
          await updateDoc(docRef, {
            pinnedMsgUser: "",
          });
        } else {
          await updateDoc(docRef, {
            pinnedMsgUser: usercredentials?._id,
          });
        }
      }
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  // search chat

  const searchHandler = () => {
    const filteredArr = chats.filter((item) => {
      if (item?.vendorName?.includes(searchText)) {
        return true;
      }
      return item?.text?.some((t) => t.text?.includes(searchText));
    });

    setChats(filteredArr);
  };

  return (
    <ChatContext.Provider
      value={{
        setEtsyMsgIds,
        sendEtsyIdsHandler,
        checkMessage,
        setCheckMessage,
        handleCheckboxChange,
        moveToChatHandler,
        moveToTrashHandler,
        permanentDeleteHandler,
        showCount,
        setShowCount,
        markAsUnreadHandler,
        markAsReadHandler,
        chats,
        setChats,
        vendorDetails,
        setVendorDetails,
        allChecked,
        setAllChecked,
        etsyCount,
        etsyMsgIds,
        pinnedMessageHadler,
        searchText,
        setSearchText,
        searchHandler,
        getSingleVendorDetails,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContextProvider;
