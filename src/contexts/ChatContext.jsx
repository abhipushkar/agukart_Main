"use client";
import React, { useEffect, useState, createContext, u } from "react";
// import { db } from "../../../src/firebase/Firebase";
import { db } from "../../src/firebase/Firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAfter,
  updateDoc,
  where,
} from "firebase/firestore";
// import useMyProvider from "hooks/useMyProvider";
import useMyProvider from "hooks/useMyProvider";
import { getAPIAuth, postAPIAuth } from "utils/__api__/ApiServies";

import { usePathname, useRouter } from "next/navigation";
import useAuth from "hooks/useAuth";
import { filter } from "lodash";

export const ChatContext = createContext(null);

const ChatContextProvider = ({ children }) => {
  const { usercredentials } = useMyProvider();

  const pathname = usePathname();
  const router = useRouter();

  const [checkMessage, setCheckMessage] = useState([]);
  const [showCount, setShowCount] = useState(0);
  const [chats, setChats] = useState([]);

  const [etsyCount, setEtsyCount] = useState(0);
  const [vendorDetails, setVendorDetails] = useState([]);
  const [allChecked, setAllChecked] = useState(false);
  const [etsyMsgIds, setEtsyMsgIds] = useState([]);
  const [unreadComposeIds, setUnreadComposeIds] = useState([]);
  const [searchText, setSearchText] = useState("");
  // pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  const [lastVisible, setLastVisible] = useState(null);
  const [firstVisible, setFirstVisible] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
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

  const markAsUnreadHandler = async () => {

    if (pathname === "/messages/etsy") {
      await markComposeAsUnread(checkMessage);

      setCheckMessage([]);
      setAllChecked(false);

      return;
    }

    checkMessage.map(async (docId) => {
      try {
        const docRef = doc(db, "chatRooms", docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          router.push('/messages');
          const myDoc = docSnap.data();
          const existingText = myDoc.text || [];

          // For user: find vendor/admin messages (not user)
          const isVendorOrAdmin = (msg) => msg.senderType === "vendor" || msg.senderType === "admin";

          // Find the last batch of vendor/admin messages
          let lastBatchIndex = -1;
          for (let i = existingText.length - 1; i >= 0; i--) {
            if (isVendorOrAdmin(existingText[i])) {
              if (lastBatchIndex === -1) {
                lastBatchIndex = i;
              }
            } else {
              // Stop when we hit user's own message
              if (lastBatchIndex !== -1) break;
            }
          }

          if (lastBatchIndex === -1) {
            setCheckMessage([]);
            return;
          }

          // Find the start of the batch
          let batchStart = lastBatchIndex;
          for (let i = lastBatchIndex - 1; i >= 0; i--) {
            if (isVendorOrAdmin(existingText[i])) {
              batchStart = i;
            } else {
              break;
            }
          }

          // Update ONLY the last batch of vendor/admin messages
          const updateArr = existingText.map((msg, index) => {
            if (index >= batchStart && isVendorOrAdmin(msg)) {
              return {
                ...msg,
                isNotification: false // Only user sees this as unread
              };
            }
            return msg;
          });

          await updateDoc(doc(db, "chatRooms", docId), {
            text: updateArr
          });
        }
        setCheckMessage([]);
      } catch (error) {
        console.error("Error getting document:", error);
        throw error;
      }
    });
  };
  const markAsReadHandler = async () => {
    if (pathname === "/messages/etsy") {
      await markComposeAsRead(checkMessage);

      setCheckMessage([]);
      setAllChecked(false);

      return;
    }
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
            // Only mark vendor/admin messages as read
            if (
              msg.messageSenderId !== usercredentials?._id &&
              (msg.senderType === "vendor" || msg.senderType === "admin")
            ) {
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
        throw error;
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
    // Don't run if usercredentials is not available
    if (!usercredentials || !usercredentials?._id) {
      console.log("⏳ Waiting for usercredentials...");
      setIsLoading(false);
      return;
    }

    if (searchText) return;
    setCheckMessage([]);
    setIsLoading(true);

    console.log("🔄 Fetching chats for user:", usercredentials._id);

    // Get total count for user's chats only using where clause
    const getTotalCount = async () => {
      try {
        let q;

        if (pathname === "/messages/etsy") {
          q = query(
            collection(db, "composeChat")
          );
        } else {
          q = query(
            collection(db, "chatRooms"),
            where("user", "==", usercredentials._id)
          );
        }

        const snapshot = await getDocs(q);
        const total = snapshot.docs.length;
        console.log("📊 Total user chats count:", total);
        setTotalCount(total);
        return total;
      } catch (error) {
        console.error("Error getting total count:", error);
        return 0;
      }
    };

    getTotalCount();

    // Build query with pagination and where clause for user's chats
    let q;

    if (pathname === "/messages/etsy") {
      q = query(
        collection(db, "composeChat"),
        orderBy("currentTime", "desc"),
        limit(rowsPerPage)
      );
    } else {
      q = query(
        collection(db, "chatRooms"),
        where("user", "==", usercredentials._id),
        orderBy("currentTime", "desc"),
        limit(rowsPerPage)
      );
    }

    // If not first page, start after lastVisible
    if (page > 0 && lastVisible) {
      q = query(
        collection(db, pathname === "/messages/etsy" ? "composeChat" : "chatRooms"),
        where("user", "==", usercredentials._id),
        orderBy("currentTime", "desc"),
        startAfter(lastVisible),
        limit(rowsPerPage)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log("📩 Snapshot received. Docs count:", snapshot.docs.length);

      if (!usercredentials?._id) {
        setIsLoading(false);
        return;
      }

      const newMessages = snapshot?.docs?.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("📝 Raw messages from query:", newMessages?.length || 0);

      // Store last visible document for next page
      if (snapshot.docs.length > 0) {
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        setFirstVisible(snapshot.docs[0]);
      }

      const vendorIds = newMessages.map((chat) => chat.receiverId);
      if (vendorIds.length) {
        getVendorDetails(vendorIds);
      }

      // Since we already filtered by user in the query, no need to filter again
      let matchingDocument = newMessages;

      // Apply filters based on pathname
      let filteredData = [];
      if (pathname === "/messages/pin") {
        filteredData = matchingDocument.filter((doc) => {
          return (
            doc.pinnedMsgUser === usercredentials._id &&
            doc.isTempDelete1 !== usercredentials._id
          );
        });
      } else if (pathname === "/messages" || pathname === "/messages/sent") {
        filteredData = matchingDocument.filter(
          (item) => item.isTempDelete1 !== usercredentials._id
        );
      } else if (pathname === "/messages/etsy") {
        console.log(
          "compose doc count",
          snapshot.docs.length
        );
        const userCreatedAt = parseUserCreatedAt(usercredentials?.createdAt);
        filteredData = newMessages.filter((item) => {
          if (item.type !== "allusers") return false;
          if (!userCreatedAt) return false;
          return (
            isAudienceAllowed(item, userCreatedAt) &&
            isSpreadAllowed(item, userCreatedAt)
          );
        });
      } else if (pathname === "/messages/inbox") {
        const isDeletefilterData = matchingDocument.filter(
          (item) => item.isTempDelete1 !== usercredentials._id
        );
        filteredData = isDeletefilterData?.filter((item) =>
          item?.text?.some((msg) => msg.messageSenderId !== usercredentials._id)
        );
      } else if (pathname === "/messages/unread") {
        filteredData = matchingDocument?.filter((item) =>
          item?.text?.some(
            (msg) =>
              msg.messageSenderId !== usercredentials._id &&
              msg?.isNotification === false
          )
        );
      } else if (pathname === "/messages/trash") {
        filteredData = matchingDocument.filter(
          (item) => item.isTempDelete1 === usercredentials._id
        );
      }

      console.log("✅ Final filtered data count:", filteredData.length);
      setChats(filteredData);
      setIsLoading(false);
    }, (error) => {
      console.error("🔥 Snapshot error:", error);
      setIsLoading(false);
    });

    return () => {
      console.log("🧹 Cleaning up subscription");
      unsubscribe();
    };
  }, [usercredentials?._id, pathname, searchText, page, rowsPerPage]);

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

          const userCreatedAt = parseUserCreatedAt(
            usercredentials?.createdAt
          );

          const composeMessages = snapshot?.docs
            ?.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            ?.filter((item) => {
              if (item.type !== "allusers") return false;
              if (!userCreatedAt) return false;

              return (
                isAudienceAllowed(item, userCreatedAt) &&
                isSpreadAllowed(item, userCreatedAt)
              );
            });

          const unreadMessages = composeMessages.filter(
            (item) => !etsyMsgIds.includes(item.id)
          );

          setUnreadComposeIds(
            unreadMessages.map((item) => item.id)
          );

          setEtsyCount(unreadMessages.length);
        }
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
              notification.messageSenderId !== usercredentials?._id &&
              (notification.senderType === "vendor" || notification.senderType === "admin")
          )
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
        setEtsyMsgIds(res.data.senderMessage.message_id || []);
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
        `user/sendMessageID`,
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

  const markComposeAsRead = async (composeIds = []) => {
    if (!composeIds.length) return;

    const unreadIds = composeIds.filter(
      (id) => !etsyMsgIds.includes(id)
    );

    if (!unreadIds.length) return;
    await sendEtsyIdsHandler(unreadIds);
  };

  const markComposeAsUnread = async (composeIds = []) => {
    if (!composeIds.length) return;

    try {
      const res = await postAPIAuth(
        `user/deleteMessageId`,
        {
          message_ids: composeIds,
        },
        token
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
      return item?.text?.some((t) =>
        t?.text?.includes(searchText) ||
        t?.productData?.productTitle?.includes(searchText)
      )
    });

    setChats(filteredArr);
  };

  // page change handlers

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    // Reset lastVisible when going back to first page
    if (newPage === 0) {
      setLastVisible(null);
    }
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    setLastVisible(null);
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
        unreadComposeIds,
        markComposeAsUnread,
        markComposeAsRead,
        pinnedMessageHadler,
        searchText,
        setSearchText,
        searchHandler,
        getSingleVendorDetails,
        page,
        setPage,
        rowsPerPage,
        setRowsPerPage,
        totalCount,
        setTotalCount,
        handleChangePage,
        handleChangeRowsPerPage,
        isLoading,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContextProvider;
