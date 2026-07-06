import { useRef } from "react";

export function usePointOfSaleRefs() {
  return {
    clientSearchRef: useRef(null),
    formRef: useRef(null),
    productSearchRef: useRef(null),
    receivedAmountRef: useRef(null),
  };
}
