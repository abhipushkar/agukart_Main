import { postAPIAuthFormData } from "utils/__api__/ApiServies";

export const uploadChatFiles = async ({
  files,
  token,
  addToast,
}) => {
  if (!files?.length) {
    return [];
  }

  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  const res = await postAPIAuthFormData(
    "chat/upload",
    formData,
    token,
    addToast
  );

  if (!res?.data?.success) {
    throw new Error("File upload failed");
  }

  return res.data.files || [];
};