const nowMonth = document.querySelector('.now-month');
const prevMonth = document.querySelector('.prev-month');
const nextMonth = document.querySelector('.next-month');
const weeks = document.querySelectorAll('.week');
let days = document.querySelectorAll('.day');
const tasks = document.querySelector('.tasks');
const calendar = document.querySelector('.calendar');
const nowDay = document.querySelector('.now-day');
const thisDate = document.querySelector('.this-date');
const closeCross = document.querySelector('.close-tasks');
const addedTasks = document.querySelector('.added-tasks');
const form = document.querySelector('.task-form');
const input = document.querySelector('.add-task-input');
const taskList = JSON.parse(localStorage.getItem('taskList')) || [];
let day;
let dayParse;
let uniqueNumber = 0;


const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const weekDays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const weekDaysNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const currentDate = new Date()
const currentMonthIndex = currentDate.getMonth();
let currentMonth = currentMonthIndex + 1;
let currentYear = currentDate.getFullYear();

setDate();

function skipMonth(e) {
  currentMonth--;
  nowMonth.classList.add('now-month-opacity');
  setTimeout(function() {
    nowMonth.classList.remove('now-month-opacity');
  }, 300);
  setDate()
}

function forwardMonth(e) {
  currentMonth++;
  nowMonth.classList.add('now-month-opacity');
  setTimeout(function() {
    nowMonth.classList.remove('now-month-opacity');
  }, 300);
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
  setTimeout(function() {
    nowMonth.innerText = monthNames[currentMonth - 1].toUpperCase();
  }, 300);
  drawDaysTable(chosenMonth);
  days = document.querySelectorAll('.day');
  days.forEach(day => day.addEventListener('click', clickedDay));
}

function drawDaysTable(chosenMonth) {
  const weekDay = chosenMonth.getDay();

  const numberOfDays = new Date(currentYear, currentMonth - 1, 0).getDate();
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
  highlightToday(chosenMonth);
}

function clickedDay() {
  day = new Date(currentYear, currentMonth - 1, this.innerText);
  dayParse = Date.parse(day);
  drawTasks(day);
  showTasks(dayParse);
  console.log(day);
}

function drawTasks(day) {
  createDate();
  tasks.classList.add('tasks-active');
  calendar.classList.add('calendar-active');
  closeCross.classList.add('close-tasks-open');
  form.classList.add('form-visible');
  closeCross.addEventListener('click', function() {
    tasks.classList.remove('tasks-active');
    calendar.classList.remove('calendar-active');
    closeCross.classList.remove('close-tasks-open');
    form.classList.remove('form-visible');
  })
}

function createTask(e) {
  e.preventDefault();
  const task = {
    name: this.querySelector('[name=task]').value,
    date: day,
    dateParse: Date.parse(day),
    number: uniqueNumber
  }
  uniqueNumber++;
  taskList.push(task);
  localStorage.setItem('taskList', JSON.stringify(taskList));
  showTasks(dayParse);
  highlightToday(day);
  this.reset();
}

function showTasks(today) {
  console.log(today, "hi");
  addedTasks.innerHTML = taskList
    .filter(task => {
      return task.dateParse == today;
    })
    .map(function(task) {
      return `<div class="task" data-number=${task.number}><span class="task-name">${task.name}</span><span class="delete-task">&#128929;</span></div>`;
    }).join('');
    document.querySelectorAll('.delete-task').forEach(del => del.addEventListener('click', deleteTask));
}

function deleteTask(e) {
  const elmNumber = this.parentElement.dataset.number;
  taskList.forEach(task => {
    if (elmNumber == task.number) {
      const elmIndex = taskList.indexOf(task);
      taskList.splice((elmIndex), 1);
      localStorage.setItem('taskList', JSON.stringify(taskList));
      this.parentElement.parentNode.removeChild(this.parentElement);
      console.log("Deleted");
    }
  });
}

function createDate() {
  const monthName = monthNames[currentMonth - 1].toUpperCase();
  const monthDay = day.getDate();
  nowDay.innerText = weekDaysNames[day.getDay()];
  thisDate.innerText = monthName + " " + monthDay + " " + currentYear;
}

function highlightToday(date) {
  weeks.forEach(week => week.querySelectorAll('div').forEach(weekday => {
    weekday.classList.remove('day-with-task');
    const temporaryToday = new Date();
    const dayCheck = Date.parse(new Date(date.getFullYear(), date.getMonth(), weekday.innerText));
    const todayCheck = Date.parse(new Date(temporaryToday.getFullYear(), temporaryToday.getMonth(), temporaryToday.getDate()));
    if (dayCheck === todayCheck && weekday.innerText != "") {
      weekday.classList.add('today-circle');
    } else {
      weekday.classList.remove('today-circle');
    }
    taskList.forEach(task => {
      if (dayCheck == task.dateParse) {
        weekday.classList.add('day-with-task');
      }
    })
  }));
}

prevMonth.addEventListener('click', skipMonth);
nextMonth.addEventListener('click', forwardMonth);
form.addEventListener('submit', createTask);
// input.addEventListener('submit', createTask);

window.onload = function() {
  nowMonth.innerText = monthNames[currentMonth - 1].toUpperCase();
  day = new Date();
  dayParse = Date.parse(day);
  createDate();
}

// indexOf for IE

if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function (obj, fromIndex) {
    if (fromIndex == null) {
        fromIndex = 0;
    } else if (fromIndex < 0) {
        fromIndex = Math.max(0, this.length + fromIndex);
    }
    for (var i = fromIndex, j = this.length; i < j; i++) {
        if (this[i] === obj)
            return i;
    }
    return -1;
  };
}
