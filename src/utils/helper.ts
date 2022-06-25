const generateRandomString = () => {
  return (Math.random() + 1).toString(36).substring(7);
};

const generateTtl = () => {
  let now = new Date();
  now.setMinutes(now.getMinutes() + 1); // timestamp
  now = new Date(now); // Date object
  return now;
};

export { generateRandomString, generateTtl };
