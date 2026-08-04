"use client";
import React, { useEffect, useState, createContext, useMemo } from "react";
import { db } from "../../src/firebase/Firebase";
import {
  collection,
  doc,
  getCountFromServer,
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
  const [allChats, setAllChats] = useState([]);
  const [allComposeChats, setAllComposeChats] = useState([]);

  const [etsyCount, setEtsyCount] = useState(0);
  const [vendorDetails, setVendorDetails] = useState([]);
  const [vendorDetailsMap, setVendorDetailsMap] = useState({});
  const [allChecked, setAllChecked] = useState(false);
  const [etsyMsgIds, setEtsyMsgIds] = useState([]);
  const [unreadComposeIds, setUnreadComposeIds] = useState([]);
  const [searchText, setSearchText] = useState("");
  // pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCursors, setPageCursors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();

  const handleCheckboxChange = (event, id) => {
    if (event.target.checked) {
      setCheckMessage([...checkMessage, id]);
    } else {
      setCheckMessage(checkMessage.filter((rowId) => rowId !== id));
    }
  };

  const moveToChatHandler = async () => {
    if (!checkMessage.length) {
      return;
    }
    try {
      await Promise.all(checkMessage.map((docId) => {
        const docRef = doc(
          db,
          pathname === "/messages/etsy" ? "composeChat" : "chatRooms",
          docId,
        );
        return updateDoc(docRef, {
          isTempDelete1: "",
        });
      }))
      setCheckMessage([]);
      setAllChecked(false);

    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const moveToTrashHandler = async () => {
    if (!checkMessage.length) return;

    try {
      await Promise.all(checkMessage.map(docId => {
        const docRef = doc(
          db,
          pathname === "/messages/etsy" ? "composeChat" : "chatRooms",
          docId
        );

        return updateDoc(docRef, {
          isTempDelete1: usercredentials?._id
        });
      })
      );

      setCheckMessage([]);
      setAllChecked(false);
    } catch (error) {
      console.error("Error moving messages to trash:", error);
    }
  };

  const permanentDeleteHandler = async () => {
    if (!checkMessage.length) return;

    try {
      await Promise.all(
        checkMessage.map(async (docId) => {
          const collectionName = pathname === "/messages/etsy" ? "composeChat" : "chatRooms";
          const docRef = doc(db, collectionName, docId);
          const docSnap = await getDoc(docRef);
          const myDoc = docSnap.data();
          const existingText = myDoc?.text || [];

          const updateArr = existingText.map((msg) => ({
            ...msg,
            permanentDeleteUser: usercredentials?._id
          }));

          return updateDoc(docRef, {
            permanentDeleteUser1: usercredentials?._id,
            text: updateArr
          });
        })
      );

      setCheckMessage([]);
      setAllChecked(false);
    } catch (error) {
      console.error("Error permanently deleting messages:", error);
    }
  };

  const markAsUnreadHandler = async () => {
    if (!checkMessage.length) return;

    if (pathname === "/messages/etsy") {
      await markComposeAsUnread(checkMessage);
      setCheckMessage([]);
      setAllChecked(false);
      return;
    }

    try {
      await Promise.all(
        checkMessage.map(async (docId) => {
          const docRef = doc(db, "chatRooms", docId);
          const docSnap = await getDoc(docRef);

          if (!docSnap.exists()) return;

          const myDoc = docSnap.data();
          const existingText = myDoc.text || [];

          const isVendorOrAdmin = (msg) => msg.senderType === "vendor" || msg.senderType === "admin";

          let lastBatchIndex = -1;

          for (let i = existingText.length - 1; i >= 0; i--) {
            if (isVendorOrAdmin(existingText[i])) {
              if (lastBatchIndex === -1) lastBatchIndex = i;
            } else if (lastBatchIndex !== -1) {
              break;
            }
          }

          if (lastBatchIndex === -1) return;

          let batchStart = lastBatchIndex;

          for (let i = lastBatchIndex - 1; i >= 0; i--) {
            if (isVendorOrAdmin(existingText[i])) {
              batchStart = i;
            } else {
              break;
            }
          }

          const updateArr = existingText.map((msg, index) => {
            if (index >= batchStart && isVendorOrAdmin(msg)) {
              return {
                ...msg,
                isNotification: false
              };
            }

            return msg;
          });

          await updateDoc(docRef, {
            text: updateArr
          });
        })
      );

      router.push("/messages");
      setCheckMessage([]);
      setAllChecked(false);
    } catch (error) {
      console.error("Error marking messages as unread:", error);
    }
  };
  const markAsReadHandler = async () => {
    if (!checkMessage.length) return;

    if (pathname === "/messages/etsy") {
      await markComposeAsRead(checkMessage);
      setCheckMessage([]);
      setAllChecked(false);
      return;
    }

    try {
      await Promise.all(
        checkMessage.map(async (docId) => {
          const docRef = doc(db, "chatRooms", docId);
          const docSnap = await getDoc(docRef);

          if (!docSnap.exists()) return;

          const myDoc = docSnap.data();
          const existingText = myDoc.text || [];

          const updateArr = existingText.map((msg) => {
            if (
              msg.messageSenderId !== usercredentials?._id &&
              (msg.senderType === "vendor" || msg.senderType === "admin")
            ) {
              return {
                ...msg,
                isNotification: true
              };
            }

            return msg;
          });

          await updateDoc(docRef, {
            text: updateArr
          });
        })
      );

      setCheckMessage([]);
      setAllChecked(false);
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
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


  // chat list logic
  useEffect(() => {
    if (!usercredentials?._id) {
      setAllChats([]);
      setIsLoading(false);
      return;
    }

    if (searchText) return;

    setIsLoading(true);

    const getTotalCount = async () => {
      try {
        const countQuery = query(
          collection(db, "chatRooms"),
          where("user", "==", usercredentials._id)
        );

        const countSnapshot = await getCountFromServer(countQuery);
        const total = countSnapshot.data().count;

        console.log("TOTAL CHAT COUNT:", total);

        setTotalCount(total);
      } catch (error) {
        console.error("Error getting total chat count:", error);
        setTotalCount(0);
      }
    };

    getTotalCount();

    const baseConstraints = [
      where("user", "==", usercredentials._id),
      orderBy("currentTime", "desc")
    ];

    let chatQuery;

    if (page === 0) {
      chatQuery = query(
        collection(db, "chatRooms"),
        ...baseConstraints,
        limit(rowsPerPage)
      );
    } else {
      const previousPageCursor = pageCursors[page - 1];

      if (!previousPageCursor) {
        console.warn("Missing cursor for page:", page);
        setIsLoading(false);
        return;
      }

      chatQuery = query(
        collection(db, "chatRooms"),
        ...baseConstraints,
        startAfter(previousPageCursor),
        limit(rowsPerPage)
      );
    }

    const unsubscribe = onSnapshot(
      chatQuery,
      (snapshot) => {
        const newMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        if (snapshot.docs.length > 0) {
          const lastDoc = snapshot.docs[snapshot.docs.length - 1];

          setPageCursors(prev => {
            if (prev[page]?.id === lastDoc.id) return prev;

            return {
              ...prev,
              [page]: lastDoc
            };
          });
        }

        const vendorIds = [...new Set(
          newMessages
            .map(chat => chat.receiverId)
            .filter(Boolean)
        )];

        if (vendorIds.length) {
          getVendorDetails(vendorIds);
        }

        setAllChats(newMessages);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error loading user chats:", error);
        setAllChats([]);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [usercredentials?._id, page, rowsPerPage]);


  const filteredChats = useMemo(() => {
    if (!allChats.length || !usercredentials?._id) return [];

    if (pathname === "/messages/pin") {
      return allChats.filter(item =>
        item.pinnedMsgUser === usercredentials._id &&
        item.isTempDelete1 !== usercredentials._id
      );
    }

    if (pathname === "/messages") {
      return allChats.filter(item =>
        item.isTempDelete1 !== usercredentials._id
      );
    }

    if (pathname === "/messages/inbox") {
      return allChats
        .filter(item => item.isTempDelete1 !== usercredentials._id)
        .filter(item =>
          item?.text?.some(msg =>
            msg.messageSenderId !== usercredentials._id
          )
        );
    }

    if (pathname === "/messages/sent") {
      return allChats
        .filter(item => item.isTempDelete1 !== usercredentials._id)
        .filter(item =>
          item?.text?.some(msg =>
            msg.messageSenderId === usercredentials._id
          )
        );
    }

    if (pathname === "/messages/unread") {
      return allChats
        .filter(item => item.isTempDelete1 !== usercredentials._id)
        .filter(item =>
          item?.text?.some(msg =>
            msg.messageSenderId !== usercredentials._id &&
            msg.isNotification === false
          )
        );
    }

    if (pathname === "/messages/trash") {
      return allChats.filter(item =>
        item.isTempDelete1 === usercredentials._id
      );
    }

    return allChats;
  }, [
    allChats,
    pathname,
    usercredentials?._id
  ]);

  useEffect(() => {
    if (pathname === "/messages/etsy") return;

    setChats(filteredChats);
  }, [filteredChats, pathname]);



  // compose list logic
  useEffect(() => {
    if (!usercredentials?._id) {
      setAllComposeChats([]);
      return;
    }

    const composeQuery = query(
      collection(db, "composeChat"),
      orderBy("currentTime", "desc")
    );

    const unsubscribe = onSnapshot(
      composeQuery,
      (snapshot) => {
        const newMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setAllComposeChats(newMessages);
      },
      (error) => {
        console.error("Error loading compose chats:", error);
        setAllComposeChats([]);
      }
    );

    return () => unsubscribe();
  }, [usercredentials?._id]);

  const eligibleComposeChats = useMemo(() => {
    if (!usercredentials?.createdAt || !allComposeChats.length) return [];

    const userCreatedAt = parseUserCreatedAt(usercredentials.createdAt);

    if (!userCreatedAt) return [];

    return allComposeChats.filter(item => {
      if (item.type !== "allusers") return false;

      return (
        isAudienceAllowed(item, userCreatedAt) &&
        isSpreadAllowed(item, userCreatedAt)
      );
    });
  }, [
    allComposeChats,
    usercredentials?.createdAt
  ]);

  useEffect(() => {
    if (pathname !== "/messages/etsy") return;

    setChats(eligibleComposeChats);
  }, [
    pathname,
    eligibleComposeChats
  ]);


  //unread cont logic
  const unreadCount = useMemo(() => {
    if (!usercredentials?._id) return 0;

    return allChats.filter(parent =>
      parent?.text?.some(msg =>
        !msg?.isNotification &&
        msg.messageSenderId !== usercredentials._id &&
        (msg.senderType === "vendor" || msg.senderType === "admin")
      )
    ).length;
  }, [
    allChats,
    usercredentials?._id
  ]);

  useEffect(() => {
    setShowCount(unreadCount);
  }, [unreadCount]);

  const unreadComposeMessages = useMemo(() => {
    if (!eligibleComposeChats.length) return [];

    return eligibleComposeChats.filter(
      item => !etsyMsgIds.includes(item.id)
    );
  }, [
    eligibleComposeChats,
    etsyMsgIds
  ]);

  useEffect(() => {
    setUnreadComposeIds(
      unreadComposeMessages.map(item => item.id)
    );

    setEtsyCount(unreadComposeMessages.length);
  }, [unreadComposeMessages]);



  useEffect(() => {
    setSearchText("");
    setCheckMessage([]);
    setAllChecked(false);
  }, [pathname]);

  const getVendorDetails = async (vendorIds = []) => {
    const uniqueIds = [...new Set(vendorIds.filter(Boolean))];

    const missingIds = uniqueIds.filter(
      id => !vendorDetailsMap[id]
    );

    if (!missingIds.length) return;

    try {
      const res = await postAPIAuth("getVendorDetails", {
        vendorId: missingIds
      });

      const vendors = res?.data?.data || [];

      setVendorDetailsMap(prev => {
        const updated = { ...prev };

        vendors.forEach(vendor => {
          updated[vendor._id] = vendor;
        });

        return updated;
      });
    } catch (error) {
      console.error("Error getting vendor details:", error);
    }
  };


  useEffect(() => {
    setAllChecked(
      chats.length > 0 &&
      checkMessage.length === chats.length
    );
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

      if (!docSnap.exists()) return;

      const docData = docSnap.data();

      const newPinnedValue =
        docData?.pinnedMsgUser === usercredentials?._id
          ? ""
          : usercredentials?._id;

      await updateDoc(docRef, {
        pinnedMsgUser: newPinnedValue
      });
    } catch (error) {
      console.error("Error updating pin:", error);
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
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    setPageCursors({});
  };

  useEffect(() => {
    setPage(0);
    setPageCursors({});
  }, [usercredentials?._id]);

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
        vendorDetailsMap,
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
