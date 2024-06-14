function validateMonth(monthname) {
  const monthNum = monthNumber(monthname);
  if (!monthNum) {
    return { isValid: false, message: "Month query parameter is required." };
  }

  if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    return {
      isValid: false,
      message: "Invalid month. Please provide a value between 1 and 12.",
    };
  }

  return { isValid: true, monthNum };
}
function monthNumber(monthName) {
  switch (monthName) {
    case "January":
      return 1;
    case "February":
      return 2;
    case "March":
      return 3;
    case "April":
      return 4;
    case "May":
      return 5;
    case "June":
      return 6;
    case "July":
      return 7;
    case "August":
      return 8;
    case "September":
      return 9;
    case "October":
      return 10;
    case "November":
      return 11;
    case "December":
      return 12;
  }
}
module.exports = { validateMonth };
