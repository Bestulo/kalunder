$(".kalunder").click(() => $(".kalunder").hide());

const log = v => (console.log(v), v);

// NOTE: This "range" includes the "stop" number. Note the "stop + 1" in the Math.ceil
const range = (start, stop, step = 1) =>
  Array(Math.ceil((stop + 1 - start) / step))
    .fill(start)
    .map((x, y) => x + y * step);

const leapYear = year => (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

const buildMonthObject = () => {
  const monthObject = {};
  monthNames.forEach((monthName, index) => {
    monthObject[index] = monthName;
  });
  return monthObject;
};

const months = buildMonthObject();

const getDayCount = (year, monthIndex) => {
  let dayCount;

  monthNames.forEach((month, index) => {
    if ([0, 2, 4, 6, 7, 9, 11].includes(monthIndex)) dayCount = 31;
    else if ([3, 5, 8, 10].includes(monthIndex)) dayCount = 30;
    else if (monthIndex === 1) dayCount = leapYear(year) ? 29 : 28;
  });

  return dayCount;
};

const dayName = day =>
  [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ][day];

function buildMonth(month, year) {
  const now = new Date();
  year = year || now.getUTCFullYear();
  month = month || now.getUTCMonth();

  const dayCount = getDayCount(year, month);
  const firstDay = new Date(year, month).getUTCDay();

  // - Reverse list of dayNumbers.
  const reversedDayNumbers = [...range(1, dayCount)].reverse();
  // - Grab the amount from day before first until day 0.
  const reversedSelectedDayNumbers = reversedDayNumbers.slice(0, firstDay);
  // - Unreverse
  const grayNumbers = reversedSelectedDayNumbers.reverse();

  // - Paste before list of normal days. If firstDay === 0, then no paste.
  // (last point goes in dayNumbersHTML or a separate function to grey out)
  const dayNumbers = [...range(1, dayCount)];
  const hhmm = now.getUTCHours() + ":" + now.getUTCMinutes();

  return {
    grayNumbers,
    firstDay,
    dayNumbers,
    hhmm
  };
}

const defaultMonth = buildMonth();

function tablize(daysHTML) {
  const numTable = daysHTML.map((day, index) =>
    index % 7 === 0 ? `</tr><tr>${day}` : `${day}`
  );
  return `<tr>${numTable}</tr>`;
}

const dayNumbersHTML = (gray, normal, firstDay) => {
  if (firstDay !== 0) {
    const grayHTML = gray.map(
      (day, index) => `<th class="grayNumber">${day}</th>`
    );
    const normalHTML = normal.map(
      (day, index) => `<th class="normalNumber day${day}">${day}</th>`
    );
    const tablizedHTML = tablize(grayHTML.concat(normalHTML));
    return tablizedHTML;
  } else {
    return tablize(
      normal.map(day => `<th class="normalNumber day${day}">${day}</th>`)
    );
  }
};

function buildHTML(month, year) {
  const now = new Date();
  year = year || now.getUTCFullYear();
  month = month || now.getUTCMonth();
  const { grayNumbers, firstDay, dayNumbers, hhmm } = buildMonth(month, year);

  const numbersHTML = dayNumbersHTML(grayNumbers, dayNumbers, firstDay);

  return {
    dayHeaders,
    numbersHTML
  };
}

const dayHeaders = () => {
  const start = "<tr>";
  const a = "<th>";
  const b = "</th>";
  const end = "</tr>";
  const initials = "SMTWTFS".split("");

  return start + initials.map(letter => a + letter + b) + end;
};

const monthOptions = monthNames
  .map(
    month => `<option value="${month}" id="select${month}">${month}</option>`
  )
  .join("");

const select = `
<select name="months" id="months">
  ${monthOptions}
</select>
`;

const currentYear = new Date().getUTCFullYear();

const yearsPast = range(1900, currentYear).map(x => String(x));

const yearsFuture = range(currentYear, currentYear + 1).map(x => String(x));

const yearOptions = yearsFuture
  .map(year => `<option value="${year}" id="year${year}">${year}</option>`)
  .join("");

const yearSelect = `
<select name="years" id="years">
  ${yearOptions}
</select>
`;

function formatAMPM(date) {
  var hours = date.getUTCHours();
  var minutes = date.getUTCMinutes();
  var ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  var strTime = hours + ":" + minutes + " " + ampm;
  return strTime;
}

$(document).ready(() => {
  const now = new Date();

  const time = {
    date: now,
    year: now.getUTCFullYear(),
    month: now.getUTCMonth(),
    day: now.getUTCDate(),
    hour: now.getUTCHours(),
    minutes: now.getUTCMinutes(),
    ampmTime: formatAMPM(now)
  };

  time.monthString = monthNames[time.month];
  const getWrittenDate = obj =>
    `${obj.day}/${obj.month + 1}/${obj.year} ${obj.ampmTime}`;
  time.writtenDate = getWrittenDate(time);

  // 22:1 is an invalid date. if minute/hour/month/day is
  // less than 10, a 0 is needed for formatting (01, 09, etc.)

  const addConditional0 = num => (num < 10 ? "0" + num : num);

  const dateFromObject = obj => {
    const str = `${time.year}-${addConditional0(
      time.month + 1
    )}-${addConditional0(time.day)}T${time.hour}:${time.minutes}`;
    const date = new Date(str);
    return date;
  };

  const resetDependentFields = () => {
    time.date = dateFromObject(time);
    time.ampmTime = formatAMPM(time.date);
    time.monthString = monthNames[time.month];
    time.writtenDate = getWrittenDate(time);
  };

  const setKalunder = dateObj => {
    const { numbersHTML } = buildHTML(dateObj.month, dateObj.year);
    $("#monthNameRoof").html(select);
    $("#kalYear").html(yearSelect);
    $(`#select${monthNames[dateObj.month]}`).attr("selected", "selected");
    $(`#select${dateObj.year}`).attr("selected", "selected");
    $("#dayHeaders").html(dayHeaders());
    $("#dayNumbers").html(numbersHTML);
    $(`.day${dateObj.day}`).addClass("selected");
    $(".timeBox .timeText").html(dateObj.writtenDate);
    $("#kalTime").attr("value", dateObj.hour + ":" + dateObj.minutes);
  };

  const setKalDaysOnly = dateObj => {
    const { numbersHTML } = buildHTML(dateObj.month, dateObj.year);
    $("#dayNumbers").html(numbersHTML);
    $(`.day${dateObj.day}`).addClass("selected");
    return attachListeners();
  };

  setKalunder(time);

  // When a day is clicked
  const attachListeners = () => {
    $("#kalunder .normalNumber").ready(() => {
      $("#kalunder .normalNumber").click(function() {
        const clickedDay = $(this).html();
        // unselect old day in html
        $(`.day${time.day}`).removeClass("selected");
        // adjust day registry to new day
        time.day = clickedDay;
        // select new day in html
        $(`.day${time.day}`).addClass("selected");
        resetDependentFields();
      });
    });

    $("#kalunder select#years").change(function() {
      const selectedYear = $(this).val();
      time.year = selectedYear;
      resetDependentFields();
      setKalDaysOnly(time);
    });
    $("#kalunder select#months").change(function() {
      console.log("mmk");
      const selectedMonth = $(this).val();
      time.month = monthNames.indexOf(selectedMonth);
      resetDependentFields();
      setKalDaysOnly(time);
    });
    $("#kalTime").on("input", function() {
      [time.hour, time.minutes] = $(this)
        .val()
        .split(":");
      resetDependentFields();
    });

    $("#kalSubmit").click(() => {
      $("#kalunder").hide();
      $("#kalSubmit").hide();
      setKalunder(time);
    });
  };

  const kalToggle = () => {
    $("#kalunder").toggle();
    $("#kalSubmit").toggle();
    setKalunder(time);
  };

  attachListeners();

  $("#kalToggle").click(() => {
    kalToggle();
    // if ($("#kalunder").is(":visible")) {
    attachListeners();
    // }
  });
});
