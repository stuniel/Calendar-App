const container = document.querySelector('.container');
const nowMonth = document.querySelector('.now-month');
const prevMonth = document.querySelector('.prev-month');
const nextMonth = document.querySelector('.next-month');
const weeks = document.querySelectorAll('.week');
let days = document.querySelectorAll('.day');
const tasks = document.querySelector('.tasks');
const tasksContainer = document.querySelector('.tasks-container');
const tasksArrow = document.querySelector('.tasks-arrow');
const calendar = document.querySelector('.calendar');
const nowDay = document.querySelector('.now-day');
const thisDate = document.querySelector('.this-date');
const closeCross = document.querySelector('.close-tasks');
const addedTasks = document.querySelector('.added-tasks');
const form = document.querySelector('.task-form');
const input = document.querySelector('.add-task-input');
const taskList = JSON.parse(localStorage.getItem('taskList')) || [];
let day, draggedElement, draggedElementObject, overDraggedElement, overDraggedElementObject, shadowTask;
let cursorStart, cursorMove;
let dayParse;
let lastClicked = weeks[0];
let taskMoveFlag = false;
let printedTasks = [];

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
  //Finding the first day of the month
  const weekDay = chosenMonth.getDay();
  days.forEach(day => day.classList.remove('clicked-day-highlight'));

  const numberOfDays = new Date(currentYear, currentMonth, 0).getDate();
  let weekNumber = 1;
  weeks.forEach(week => {
    for (let i = 0; i < 7; i++) {
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
  lastClicked.classList.remove('clicked-day-highlight');
  this.classList.add('clicked-day-highlight');
  lastClicked = this;
  drawTasks(day);
  updateTasks(dayParse);
}

function drawTasks(day) {
  createDate();
  container.classList.add('container-active');
  tasks.classList.add('tasks-active');
  tasksContainer.classList.add('tasks-container-active');
  tasksArrow.classList.add('tasks-arrow-active');
  thisDate.classList.add('this-date-active');
  calendar.classList.add('calendar-active');
  closeCross.classList.add('close-tasks-open');
  form.classList.add('form-visible');
  closeCross.addEventListener('click', function() {
    container.classList.remove('container-active');
    tasks.classList.remove('tasks-active');
    tasksContainer.classList.remove('tasks-container-active');
    tasksArrow.classList.remove('tasks-arrow-active');
    thisDate.classList.remove('this-date-active');
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
    number: (function () {
      let password = "";
      const passwordLetters = "qwertyuiopasdfghjklzxcvbnm1234567890";
      for (let i = 0; i < 12; i++) {
        password += passwordLetters.charAt(Math.random() * passwordLetters.length);
      }
      return password;
    })()
  }
  taskList.push(task);
  localStorage.setItem('taskList', JSON.stringify(taskList));
  updateTasks(dayParse);
  highlightToday(day);
  this.reset();
  if (window.innerWidth < 501) {
    addedTasks.style.height = (addedTasks.clientHeight + 50) + "px";
  }
  console.table(taskList);
}

function updateTasks(today) {
  addedTasks.innerHTML = taskList
    .filter(task => {
      return task.dateParse == today;
    })
    .map(function(task) {
      return `<div class="task draggable" data-number=${task.number}><span class="task-name">${task.name}</span><span class="delete-task">&#128929;</span></div>`;
    }).join('');
  printedTasks = document.querySelectorAll('.task');
  document.querySelectorAll('.delete-task').forEach(del => del.addEventListener('click', deleteTask));

  printedTasks.forEach(printedTask => printedTask.addEventListener('mousedown', startDragging));
  printedTasks.forEach(printedTask => printedTask.addEventListener('touchstart', startDragging));
  printedTasks.forEach(printedTask => printedTask.addEventListener('dragstart', function(e) {
    e.dataTransfer.setData('text/plain', 'node');
    startDragging();
  }));
  printedTasks.forEach(printedTask => printedTask.addEventListener('drag', continueDragging));
  printedTasks.forEach(printedTask => printedTask.addEventListener('touchmove', continueDraggingTouch));
  window.addEventListener('mouseout', function(e) {
    if(taskMoveFlag) {
      console.log('hello', shadowTask)
      printedTasks.forEach(printedTask => printedTask.classList.remove('dragged-task'))
      taskMoveFlag = false;
      localStorage.setItem('taskList', JSON.stringify(taskList));
    }
  });

  function startDragging(e) {
    printedTasks.forEach(printedTask => {
      if (printedTask.dataset.number == this.dataset.number) {
        shadowTask = printedTask;
        shadowTask.classList.add('dragged-task');
      }
    })
    taskMoveFlag = true;
    taskList.forEach(task => { if(task.number == this.dataset.number) draggedElementObject = task })
  }

  function continueDragging(e) {
    if (!taskMoveFlag) return;
    else {
      printedTasks.forEach(printedTask => {
        if (printedTask != this && e.clientY < (printedTask.offsetTop + printedTask.clientHeight) && e.clientY > printedTask.offsetTop) {
          overDraggedElement = printedTask;
          taskList.forEach(task => { if(task.number == overDraggedElement.dataset.number) overDraggedElementObject = task })
          taskList.move(taskList.indexOf(draggedElementObject), taskList.indexOf(overDraggedElementObject));
        }
      })
    }
    updateTasks(dayParse);
    printedTasks.forEach(printedTask => {
      if (printedTask.dataset.number == this.dataset.number) {
        shadowTask = printedTask;
        shadowTask.classList.add('dragged-task');
      }
    })
  }

  // For touch screens

  function continueDraggingTouch(e) {
    const touch = event.touches[0]
    printedTasks.forEach(printedTask => {
      if (taskMoveFlag && printedTask != this && touch.pageY < (printedTask.offsetTop + printedTask.clientHeight) && touch.pageY > printedTask.offsetTop) {
        overDraggedElement = printedTask;
        taskList.forEach(task => { if(task.number == overDraggedElement.dataset.number) overDraggedElementObject = task })
        taskList.move(taskList.indexOf(draggedElementObject), taskList.indexOf(overDraggedElementObject));
      }
    })
    updateTasks(dayParse);
  }

  // Close cross

  printedTasks.forEach(printedTask => printedTask.addEventListener('mouseover', function(e) {
    this.querySelector('.delete-task').classList.add('cross-visible');
  }));
  printedTasks.forEach(printedTask => printedTask.addEventListener('mouseout', function(e) {
    this.querySelector('.delete-task').classList.remove('cross-visible');
  }));

  function deleteTask(e) {
    const elmNumber = this.parentElement.dataset.number;
    taskList.forEach(task => {
      if (elmNumber == task.number) {
        console.log(this.parentNode);
        this.parentElement.classList.add('removed-task');
        const elmIndex = taskList.indexOf(task);
        this.parentElement.parentNode.removeChild(this.parentElement);
        console.log(this.parentNode);
        taskList.splice((elmIndex), 1);
        localStorage.setItem('taskList', JSON.stringify(taskList));
        highlightToday(day);
      }
    });
  }
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
      weekday.classList.add('today-background');
    } else {
      weekday.classList.remove('today-background');
    }
    taskList.forEach(task => {
      if (dayCheck == task.dateParse) {
        weekday.classList.add('day-with-task');
      }
    })
  }));
}

function scrollPageToTasks(e) {
  console.log(this.getBoundingClientRect().bottom);
  console.log(window.scrollY);
  const tasksTop = this.getBoundingClientRect().bottom;
  let taskScroll = 0;
  while (taskScroll < tasksTop) {
    setInterval(function() {
      taskScroll += 10 + "px";
      window.scrollTo(0, taskScroll);
    }, 10);
  }
}

tasksArrow.addEventListener('click', scrollPageToTasks);
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
    for (let i = fromIndex, j = this.length; i < j; i++) {
        if (this[i] === obj)
            return i;
    }
    return -1;
  };
}

if (!Array.prototype.move) {
  Array.prototype.move = function (from, to) {
    this.splice(to, 0, this.splice(from, 1)[0]);
  };
}
