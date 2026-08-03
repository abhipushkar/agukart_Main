import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/Firebase";

export const markIncomingMessagesAsRead = async ({
  chatId,
  messages = [],
  senderId
}) => {
  if (!chatId || !senderId || !messages.length) return;

  if (
    typeof document !== "undefined" &&
    document.visibilityState !== "visible"
  ) {
    return;
  }

  const hasUnread = messages.some(
    msg =>
      msg.messageSenderId !== senderId &&
      (msg.senderType === "vendor" || msg.senderType === "admin") &&
      msg.isNotification === false
  );

  if (!hasUnread) return;

  const updatedText = messages.map(msg => {
    if (
      msg.messageSenderId !== senderId &&
      (msg.senderType === "vendor" || msg.senderType === "admin") &&
      msg.isNotification === false
    ) {
      return {
        ...msg,
        isNotification: true
      };
    }

    return msg;
  });

  await updateDoc(doc(db, "chatRooms", chatId), {
    text: updatedText
  });
};