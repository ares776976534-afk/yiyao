import type { TypeStoreServices } from "@/stores/types";
import { uploadImageBase64ReturnUrl } from "./uploadImage";
import { uploadImageFile } from "./uploadImageFile";
import { queryOfferBy } from "./queryOfferBy";

export const storeServices: TypeStoreServices = {
  file: {
    uploadImageBase64ReturnUrl,
    uploadImageFile,
  },
  offer: {
    queryOfferBy,
  },
};

