const convertDate = (dateString) => {
  const convertedDate = new Date(dateString).toISOString();
  return convertedDate;
};

module.exports = convertDate;
