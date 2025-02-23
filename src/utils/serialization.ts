/**
 * Serializes an object by converting BigInt values to strings
 * @param obj The object to serialize
 * @returns The serialized object with BigInt values converted to strings
 */
export const serializeData = <T>(obj: T): T => {
  return JSON.parse(
    JSON.stringify(obj, (key, value) => 
      typeof value === 'bigint' 
        ? value.toString() 
        : value
    )
  );
};

/**
 * Safely serializes a response object by handling BigInt values
 * @param data The data to include in the response
 * @param message Optional message to include
 * @param status Optional status code (defaults to 200)
 */
export const createSerializedResponse = <T>(data: T, message?: string, status: number = 200) => {
  return {
    status,
    message,
    data: serializeData(data)
  };
};
