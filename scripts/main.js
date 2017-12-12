'use strict';

var container = document.querySelector('.container');
var nowMonth = document.querySelector('.now-month');
var prevMonth = document.querySelector('.prev-month');
var nextMonth = document.querySelector('.next-month');
var weeks = document.querySelectorAll('.week');
var days = document.querySelectorAll('.day');
var tasks = document.querySelector('.tasks');
var tasksContainer = document.querySelector('.tasks-container');
var tasksArrow = document.querySelector('.tasks-arrow');
var calendar = document.querySelector('.calendar');
var nowDay = document.querySelector('.now-day');
var thisDate = document.querySelector('.this-date');
var closeCross = document.querySelector('.close-tasks');
var addedTasks = document.querySelector('.added-tasks');
var form = document.querySelector('.task-form');
var input = document.querySelector('.add-task-input');
var taskList = JSON.parse(localStorage.getItem('taskList')) || [];
var day = void 0,
    draggedElement = void 0,
    draggedElementObject = void 0,
    overDraggedElement = void 0,
    overDraggedElementObject = void 0,
    shadowTask = void 0;
var cursorStart = void 0,
    cursorMove = void 0;
var dayParse = void 0;
var lastClicked = weeks[0];
var taskMoveFlag = false;
var printedTasks = [];

var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var weekDays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
var weekDaysNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

var currentDate = new Date();
var currentMonthIndex = currentDate.getMonth();
var currentMonth = currentMonthIndex + 1;
var currentYear = currentDate.getFullYear();

setDate();

function skipMonth(e) {
  currentMonth--;
  nowMonth.classList.add('now-month-opacity');
  setTimeout(function () {
    nowMonth.classList.remove('now-month-opacity');
  }, 300);
  setDate();
}

function forwardMonth(e) {
  currentMonth++;
  nowMonth.classList.add('now-month-opacity');
  setTimeout(function () {
    nowMonth.classList.remove('now-month-opacity');
  }, 300);
  setDate();
}

function setDate() {
  if (currentMonth < 10) {
    currentMonth = "0" + currentMonth;
  }if (currentMonth > 12) {
    currentMonth -= 12;
    currentYear += 1;
  }if (currentMonth < 1) {
    currentMonth += 12;
    currentYear -= 1;
  }
  var yearMonthDate = currentYear + "-" + currentMonth;
  var chosenMonth = new Date(yearMonthDate);
  setTimeout(function () {
    nowMonth.innerText = monthNames[currentMonth - 1].toUpperCase();
  }, 300);
  drawDaysTable(chosenMonth);
  days = document.querySelectorAll('.day');
  days.forEach(function (day) {
    return day.addEventListener('click', clickedDay);
  });
}

function drawDaysTable(chosenMonth) {
  //Finding the first day of the month
  var weekDay = chosenMonth.getDay();
  days.forEach(function (day) {
    return day.classList.remove('clicked-day-highlight');
  });

  var numberOfDays = new Date(currentYear, currentMonth, 0).getDate();
  var weekNumber = 1;
  weeks.forEach(function (week) {
    for (var i = 0; i < 7; i++) {
      var dayNumber = i - weekDay + 1 + (weekNumber * 7 - 7);
      if (dayNumber > 0 && dayNumber <= numberOfDays) {
        week.querySelector('.' + weekDays[i]).innerText = dayNumber;
        week.querySelector('.' + weekDays[i]).classList.add('day');
      } else {
        week.querySelector('.' + weekDays[i]).innerText = "";
        week.querySelector('.' + weekDays[i]).classList.remove('day');
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
  closeCross.addEventListener('click', function () {
    container.classList.remove('container-active');
    tasks.classList.remove('tasks-active');
    tasksContainer.classList.remove('tasks-container-active');
    tasksArrow.classList.remove('tasks-arrow-active');
    thisDate.classList.remove('this-date-active');
    calendar.classList.remove('calendar-active');
    closeCross.classList.remove('close-tasks-open');
    form.classList.remove('form-visible');
  });
}

function createTask(e) {
  e.preventDefault();
  var task = {
    name: this.querySelector('[name=task]').value,
    date: day,
    dateParse: Date.parse(day),
    number: function () {
      var password = "";
      var passwordLetters = "qwertyuiopasdfghjklzxcvbnm1234567890";
      for (var i = 0; i < 12; i++) {
        password += passwordLetters.charAt(Math.random() * passwordLetters.length);
      }
      return password;
    }()
  };
  taskList.push(task);
  localStorage.setItem('taskList', JSON.stringify(taskList));
  updateTasks(dayParse);
  highlightToday(day);
  this.reset();
  if (window.innerWidth < 501) {
    addedTasks.style.height = addedTasks.clientHeight + 50 + "px";
  }
  console.table(taskList);
}

function updateTasks(today) {
  addedTasks.innerHTML = taskList.filter(function (task) {
    return task.dateParse == today;
  }).map(function (task) {
    return '<div class="task draggable" data-number=' + task.number + '><span class="task-name">' + task.name + '</span><span class="delete-task">&#128929;</span></div>';
  }).join('');
  printedTasks = document.querySelectorAll('.task');
  document.querySelectorAll('.delete-task').forEach(function (del) {
    return del.addEventListener('click', deleteTask);
  });

  printedTasks.forEach(function (printedTask) {
    return printedTask.addEventListener('mousedown', startDragging);
  });
  printedTasks.forEach(function (printedTask) {
    return printedTask.addEventListener('touchstart', startDragging);
  });
  printedTasks.forEach(function (printedTask) {
    return printedTask.addEventListener('dragstart', function (e) {
      e.dataTransfer.setData('text/plain', 'node');
      startDragging();
    });
  });
  printedTasks.forEach(function (printedTask) {
    return printedTask.addEventListener('drag', continueDragging);
  });
  printedTasks.forEach(function (printedTask) {
    return printedTask.addEventListener('touchmove', continueDraggingTouch);
  });
  window.addEventListener('mouseout', function (e) {
    if (taskMoveFlag) {
      console.log('hello', shadowTask);
      printedTasks.forEach(function (printedTask) {
        return printedTask.classList.remove('dragged-task');
      });
      taskMoveFlag = false;
      localStorage.setItem('taskList', JSON.stringify(taskList));
    }
  });

  function startDragging(e) {
    var _this = this;

    printedTasks.forEach(function (printedTask) {
      if (printedTask.dataset.number == _this.dataset.number) {
        shadowTask = printedTask;
        shadowTask.classList.add('dragged-task');
      }
    });
    taskMoveFlag = true;
    taskList.forEach(function (task) {
      if (task.number == _this.dataset.number) draggedElementObject = task;
    });
  }

  function continueDragging(e) {
    var _this2 = this;

    if (!taskMoveFlag) return;else {
      printedTasks.forEach(function (printedTask) {
        if (printedTask != _this2 && e.clientY < printedTask.offsetTop + printedTask.clientHeight && e.clientY > printedTask.offsetTop) {
          overDraggedElement = printedTask;
          taskList.forEach(function (task) {
            if (task.number == overDraggedElement.dataset.number) overDraggedElementObject = task;
          });
          taskList.move(taskList.indexOf(draggedElementObject), taskList.indexOf(overDraggedElementObject));
        }
      });
    }
    updateTasks(dayParse);
    printedTasks.forEach(function (printedTask) {
      if (printedTask.dataset.number == _this2.dataset.number) {
        shadowTask = printedTask;
        shadowTask.classList.add('dragged-task');
      }
    });
  }

  // For touch screens

  function continueDraggingTouch(e) {
    var _this3 = this;

    var touch = event.touches[0];
    printedTasks.forEach(function (printedTask) {
      if (taskMoveFlag && printedTask != _this3 && touch.pageY < printedTask.offsetTop + printedTask.clientHeight && touch.pageY > printedTask.offsetTop) {
        overDraggedElement = printedTask;
        taskList.forEach(function (task) {
          if (task.number == overDraggedElement.dataset.number) overDraggedElementObject = task;
        });
        taskList.move(taskList.indexOf(draggedElementObject), taskList.indexOf(overDraggedElementObject));
      }
    });
    updateTasks(dayParse);
  }

  // Close cross

  printedTasks.forEach(function (printedTask) {
    return printedTask.addEventListener('mouseover', function (e) {
      this.querySelector('.delete-task').classList.add('cross-visible');
    });
  });
  printedTasks.forEach(function (printedTask) {
    return printedTask.addEventListener('mouseout', function (e) {
      this.querySelector('.delete-task').classList.remove('cross-visible');
    });
  });

  function deleteTask(e) {
    var _this4 = this;

    var elmNumber = this.parentElement.dataset.number;
    taskList.forEach(function (task) {
      if (elmNumber == task.number) {
        console.log(_this4.parentNode);
        _this4.parentElement.classList.add('removed-task');
        var elmIndex = taskList.indexOf(task);
        _this4.parentElement.parentNode.removeChild(_this4.parentElement);
        console.log(_this4.parentNode);
        taskList.splice(elmIndex, 1);
        localStorage.setItem('taskList', JSON.stringify(taskList));
        highlightToday(day);
      }
    });
  }
}

function createDate() {
  var monthName = monthNames[currentMonth - 1].toUpperCase();
  var monthDay = day.getDate();
  nowDay.innerText = weekDaysNames[day.getDay()];
  thisDate.innerText = monthName + " " + monthDay + " " + currentYear;
}

function highlightToday(date) {
  weeks.forEach(function (week) {
    return week.querySelectorAll('div').forEach(function (weekday) {
      weekday.classList.remove('day-with-task');
      var temporaryToday = new Date();
      var dayCheck = Date.parse(new Date(date.getFullYear(), date.getMonth(), weekday.innerText));
      var todayCheck = Date.parse(new Date(temporaryToday.getFullYear(), temporaryToday.getMonth(), temporaryToday.getDate()));
      if (dayCheck === todayCheck && weekday.innerText != "") {
        weekday.classList.add('today-background');
      } else {
        weekday.classList.remove('today-background');
      }
      taskList.forEach(function (task) {
        if (dayCheck == task.dateParse) {
          weekday.classList.add('day-with-task');
        }
      });
    });
  });
}

function scrollPageToTasks(e) {
  console.log(this.getBoundingClientRect().bottom);
  console.log(window.scrollY);
  var tasksTop = this.getBoundingClientRect().bottom;
  var taskScroll = 0;
  while (taskScroll < tasksTop) {
    setInterval(function () {
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

window.onload = function () {
  nowMonth.innerText = monthNames[currentMonth - 1].toUpperCase();
  day = new Date();
  dayParse = Date.parse(day);
  createDate();
};

// indexOf for IE

if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function (obj, fromIndex) {
    if (fromIndex == null) {
      fromIndex = 0;
    } else if (fromIndex < 0) {
      fromIndex = Math.max(0, this.length + fromIndex);
    }
    for (var i = fromIndex, j = this.length; i < j; i++) {
      if (this[i] === obj) return i;
    }
    return -1;
  };
}

if (!Array.prototype.move) {
  Array.prototype.move = function (from, to) {
    this.splice(to, 0, this.splice(from, 1)[0]);
  };
}
