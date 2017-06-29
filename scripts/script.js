const nowMonth = document.querySelector('.now-month');
const prevMonth = document.querySelector('.prev-month');
const nextMonth = document.querySelector('.next-month');
const weeks = document.querySelectorAll('.week');
let days = document.querySelectorAll('.day');

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const weekDays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const currentDate = new Date()
const currentMonthIndex = currentDate.getMonth();
let currentMonth = currentMonthIndex + 1;
let currentYear = currentDate.getFullYear();

setDate();

function skipMonth(e) {
  currentMonth--;
  setDate()
}

function forwardMonth(e) {
  currentMonth++;
  setDate()
}

function setDate() {
  if (currentMonth < 10) {
    currentMonth = "0" + currentMonth;
  } if (currentMonth > 12) {
    currentMonth -= 12;
    currentYear += 1;
  } if (currentMonth < 1) {
    currentMonth += 12;
    currentYear -= 1;
  }

  let yearMonthDate = currentYear + "-" + currentMonth;
  const chosenMonth = new Date(yearMonthDate)
  nowMonth.innerText = monthNames[currentMonth - 1].toUpperCase();
  drawDaysTable(chosenMonth);
  days = document.querySelectorAll('.day'); 
}

function drawDaysTable(chosenMonth) {
  const weekDay = chosenMonth.getDay();
  const numberOfDays = new Date(currentYear, currentMonth, 0).getDate();
  let weekNumber = 1;
  weeks.forEach(week => {
    for (i = 0; i < 7; i++) {
      let dayNumber = (i - weekDay + 1) + (weekNumber * 7 - 7);
      if (dayNumber > 0 && dayNumber <= numberOfDays) {
        week.querySelector(`.${weekDays[i]}`).innerText = dayNumber;
        week.querySelector(`.${weekDays[i]}`).classList.add('day');
      } else {
        week.querySelector(`.${weekDays[i]}`).innerText = "";
        week.querySelector(`.${weekDays[i]}`).classList.remove('day');
      }
    }
    weekNumber++;
  });
}

prevMonth.addEventListener('click', skipMonth);
nextMonth.addEventListener('click', forwardMonth);
