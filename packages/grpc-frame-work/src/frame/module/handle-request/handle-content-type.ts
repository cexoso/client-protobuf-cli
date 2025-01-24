export function getCallTypeByContentType(contentType: string | undefined): {
  isApiCall: boolean;
  isRPC: boolean;
  isJSON: boolean;
} {
  if (contentType === undefined) {
    return {
      isApiCall: false,
      isRPC: false,
      isJSON: false,
    };
  }
  const isJSON = Boolean(contentType && contentType.match("application/json"));
  const isRPC = contentType === "application/grpc";
  const isApiCall = isJSON || isRPC;

  return {
    isApiCall,
    isRPC,
    isJSON,
  };
}
