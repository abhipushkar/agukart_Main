import { useContext } from "react";
import { ChatContext } from "contexts/ChatContext";

const useChat = () => {
  const {
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
    setEtsyMsgIds,
    sendEtsyIdsHandler,
    etsyMsgIds,
    pinnedMessageHadler,
    searchText,
    setSearchText,
    searchHandler,
    getSingleVendorDetails
  } = useContext(ChatContext);

  return {
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
    setEtsyMsgIds,
    sendEtsyIdsHandler,
    etsyMsgIds,
    pinnedMessageHadler,
    searchText,
    setSearchText,
    searchHandler,
    getSingleVendorDetails
  };
};

export default useChat;
