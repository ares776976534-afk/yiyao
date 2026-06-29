const getID = function (length = 20, current = '') {
  let charLength = length;
  return charLength
    ? getID(
      --charLength,
      '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.charAt(
        Math.floor(Math.random() * 60),
      ) + current,
    )
    : current;
};

export default getID;
