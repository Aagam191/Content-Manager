import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Calendar.css";
import '@fortawesome/fontawesome-free/css/all.min.css';
import InstagramBox from "./InstagramBox";
import DiscordBox from "./Discordbox";
import YoutubeBox from "./Youtubebox";
import Carousel from "./Carousel";
const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [taskInput, setTaskInput] = useState("");
  const [taskDateInput, setTaskDateInput] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date()); // Default to current date

  const month = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();

  // Fetch tasks from the API
  const [tasks, setTasks] = useState({});

  const token = localStorage.getItem('authToken');  // Assume you store the auth token in localStorage

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get('http://localhost:8000/todos/', {
          headers: {
            Authorization: `Bearer ${token}`,  // Include the token in the request
          },
        });
        console.log('Fetched tasks:', response.data);  // Check what data is returned
        const fetchedTasks = response.data;
        const tasksByDate = {};
  
        fetchedTasks.forEach(task => {
          const taskDate = new Date(task.due_date).toDateString();
          if (!tasksByDate[taskDate]) tasksByDate[taskDate] = [];
          tasksByDate[taskDate].push(task);
        });
  
        setTasks(tasksByDate);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };
  
    fetchTasks();
  }, [token]);
  
  const handleAddTask = async () => {
    if (taskInput.trim() !== "" && taskDateInput.trim() !== "") {
      const [day, month, year] = taskDateInput.split("-");
      const taskDate = new Date(`${year}-${month}-${day}`);
  
      try {
        const response = await axios.post('http://localhost:8000/todos/', {
          title: taskInput,
          due_date: taskDate.toISOString().split('T')[0],  // Convert to YYYY-MM-DD format
        }, {
          headers: {
            Authorization: `Bearer ${token}`,  // Include token if required
          },
        });
  
        const newTask = response.data;  // Assuming response contains id and title
        const dateKey = new Date(newTask.due_date).toDateString();
  
        setTasks(prevTasks => ({
          ...prevTasks,
          [dateKey]: [...(prevTasks[dateKey] || []), newTask],  // Add full task object
        }));
  
        setTaskInput("");
        setTaskDateInput("");
      } catch (error) {
        console.error('Error adding task:', error);
      }
    }
  };
  
  const handleRemoveTask = async (dateKey, index) => {
    try {
      const taskToRemove = tasks[dateKey][index];
      if (taskToRemove && taskToRemove.id) {
        await axios.delete(`http://localhost:8000/todos/${taskToRemove.id}/`, {
          headers: {
            Authorization: `Bearer ${token}`,  // Include token if required
          },
        });
  
        // Remove the task from the state
        const newTasks = { ...tasks };
        newTasks[dateKey].splice(index, 1);  // Remove task by index
        if (newTasks[dateKey].length === 0) {
          delete newTasks[dateKey];
        }
        setTasks(newTasks);
      } else {
        console.error('Task ID not found');
      }
    } catch (error) {
      console.error('Error removing task:', error);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const generateCalendar = () => {
    const firstDayOfMonth = new Date(year, currentDate.getMonth(), 1).getDay();
    const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();
    const prevMonthDaysCount = new Date(year, currentDate.getMonth(), 0).getDate();
    const calendarDays = [];
    let dayCounter = 1;
  
    const today = new Date(); // Get the current date
  
    for (let i = 0; i < 6; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDayOfMonth) {
          week.push(
            <div className="col cell" key={j}>
              <span className="number gray">
                {prevMonthDaysCount - (firstDayOfMonth - j - 1)}
              </span>
            </div>
          );
        } else if (dayCounter <= daysInMonth) {
          const currentDay = new Date(year, currentDate.getMonth(), dayCounter);
          const dateKey = currentDay.toDateString();
  
          const isToday = currentDay.toDateString() === today.toDateString();
  
          week.push(
            <div
              className="col cell"
              key={j}
              onClick={() => handleDateClick(currentDay)}
            >
              {isToday && <div className="current-date-indicator"></div>}
              {tasks[dateKey] && tasks[dateKey].length > 0 && (
                <div className="task-indicator"></div>
              )}
              <span className="number">{dayCounter}</span>
            </div>
          );
          dayCounter++;
        } else {
          week.push(
            <div className="col cell" key={j}>
              <span className="number gray">
                {dayCounter - daysInMonth}
              </span>
            </div>
          );
          dayCounter++;
        }
      }
      calendarDays.push(
        <div className="row" key={i}>
          {week}
        </div>
      );
    }
  
    return calendarDays;
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const renderTasksForSelectedDate = () => {
    const dateKey = selectedDate ? selectedDate.toDateString() : null;
    const tasksForDate = tasks[dateKey] || [];
  
    return tasksForDate.map((task, index) => (
      <li key={task.id || index} className="todo-item">  {/* Use task.id or index */}
        {task.title || 'No Title'}  {/* Handle case where title might be missing */}
        <button className="remove-task" onClick={() => handleRemoveTask(dateKey, index)}>
          &times;
        </button>
      </li>
    ));
  };

  return (
    <>
      <div className="calendar">
        <div className="header">
          <span className="month-year">{`${month.toUpperCase()} ${year}`}</span>
          <div className="icon-container">
            <i className="fas fa-chevron-left icon" onClick={handlePrevMonth}></i>
            <i className="fas fa-chevron-right icon" onClick={handleNextMonth}></i>
          </div>
        </div>
        <hr/>
        <div className="days">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div className="col" key={day}>
              {day}
            </div>
          ))}
        </div>
        <div>{generateCalendar()}</div>
      </div>

      <div className="todo-list">
        <h3 className="datess">To-Do List for {selectedDate.toDateString()}</h3>
        <div className="todo-input">
          <input
            type="text"
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            placeholder="Add a new task"
          />
          <input
            type="text"
            value={taskDateInput}
            onChange={(e) => setTaskDateInput(e.target.value)}
            placeholder="(DD-MM-YYYY)"
          />
          <button onClick={handleAddTask}>Add</button>
        </div>
        {tasks[selectedDate.toDateString()] && tasks[selectedDate.toDateString()].length > 0 ? (
          <ul className="todo-items">
            {renderTasksForSelectedDate()}
          </ul>
        ) : (
          <p className="no-tTasks">No tasks for this date</p>
        )}

      </div>
      <Carousel/>
  <div class="youtube-box"><YoutubeBox/></div>
  

    <div class="instagram-box"><InstagramBox/></div>
    <div class="discord-box"><DiscordBox/></div>
  


 
    </>
  );
};

export default Calendar;
