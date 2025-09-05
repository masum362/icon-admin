export const buildUrl = (endpoint: string, params: any) => {
  const url = new URL(endpoint, "https://sandbox.iconadmissionaid.com");
  Object.keys(params).forEach((key) => {
    if (params[key]) {
      url.searchParams.append(key, params[key]);
    }
  });
  return url.toString();
};

export const buildUrlMultiValue = (
  endpoint: string,
  params: Record<string, any>
) => {
  const url = new URL(endpoint, "https://sandbox.iconadmissionaid.com");

  Object.keys(params).forEach((key) => {
    const value = params[key];
    if (Array.isArray(value)) {
      // If the value is an array, append each item with the same key
      value.forEach((item) => {
        url.searchParams.append(key, item);
      });
    } else if (value) {
      // If the value is not an array, append it directly
      url.searchParams.append(key, value);
    }
  });

  return url.toString();
};
