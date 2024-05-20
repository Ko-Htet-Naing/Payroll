const { eachDayOfInterval, getDay } = require("date-fns");

function countSaturdaysAndSundays(year, month) {
  const startDate = new Date(year, month - 1, 1); // month is 0-indexed
  const endDate = new Date(year, month, 0); // Get the last day of the month
  const daysOfMonth = eachDayOfInterval({ start: startDate, end: endDate });

  let saturdaysCount = 0;
  let sundaysCount = 0;

  daysOfMonth.forEach((day) => {
    const dayOfWeek = getDay(day);
    if (dayOfWeek === 6) {
      // Saturday
      saturdaysCount++;
    } else if (dayOfWeek === 0) {
      // Sunday
      sundaysCount++;
    }
  });

  return { saturdaysCount, sundaysCount };
}

// Get current month and year if no input is provided
const args = process.argv.slice(2);
let year, month;
if (args.length === 2) {
  year = parseInt(args[0]);
  month = parseInt(args[1]);
} else {
  const today = new Date();
  year = today.getFullYear();
  month = today.getMonth() + 1; // getMonth() returns 0-indexed month
}

const { saturdaysCount, sundaysCount } = countSaturdaysAndSundays(year, month);
console.log(
  `In ${year}-${month}, there are ${saturdaysCount} Saturdays and ${sundaysCount} Sundays and total ${
    saturdaysCount + sundaysCount
  }.`
);
