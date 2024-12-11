import React, { useState, useEffect } from 'react';
import { auth } from './Firebase'; // Import Firebase auth for logout functionality
import { collection, addDoc, onSnapshot, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import { db } from './Firebase'; // Import Firestore instance
import './style.css'; // Import your custom CSS for styling

// Import Recharts for the new chart
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa'; // Import sorting icons from react-icons

const TaskTracker = () => {
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState('');
  const [priority, setPriority] = useState('Medium'); // State for task priority
  const [deadline, setDeadline] = useState(''); // State for task deadline
  const [sortBy, setSortBy] = useState(''); // State for sorting criteria (priority or deadline)
  const [sortOrder, setSortOrder] = useState('asc'); // State for sort order (ascending or descending)
  const navigate = useNavigate(); // Use navigate to redirect

  // Fetch tasks from Firestore in real-time using onSnapshot
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      // Use onSnapshot to listen to real-time updates for the logged-in user's tasks
      const unsubscribe = onSnapshot(
        collection(db, 'tasks'),
        (querySnapshot) => {
          // Filter tasks to show only the logged-in user's tasks
          const taskList = querySnapshot.docs
            .filter((doc) => doc.data().userId === user.uid) // Filter tasks for the logged-in user
            .map((doc) => ({ ...doc.data(), id: doc.id }));
          setTasks(taskList); // Update state with the latest tasks
        },
        (error) => {
          console.log('Error fetching tasks:', error);
        }
      );

      // Cleanup on component unmount
      return () => unsubscribe();
    }
  }, []);

  // Add a new task to Firestore
  const addTask = async () => {
    const user = auth.currentUser;  // Get the logged-in user
    if (user && taskInput.trim() !== '') {  // Ensure task input is not empty
      try {
        // Add a new task with userId to associate it with the logged-in user
        await addDoc(collection(db, 'tasks'), {
          text: taskInput,  // Store the task text
          completed: false,
          priority: priority,
          deadline: deadline,
          userId: user.uid,  // Store userId to associate with the task
        });
        setTaskInput('');  // Clear input after adding
      } catch (error) {
        console.error('Error adding task:', error);
      }
    } else {
      console.log("Task input cannot be empty.");
    }
  };

  // Toggle task completion in Firestore
  const toggleCompletion = async (id) => {
    const taskRef = doc(db, 'tasks', id);
    const task = tasks.find((task) => task.id === id);
    await updateDoc(taskRef, { completed: !task.completed });
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)));
  };

  // Delete a task from Firestore
  const deleteTask = async (id) => {
    try {
      await deleteDoc(doc(db, 'tasks', id));
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (e) {
      console.error('Error deleting task: ', e);
    }
  };

  // Logout functionality
  const handleLogout = () => {
    auth.signOut(); // Log the user out
    navigate('/'); // Redirect to the home or login page
  };

  // Sort tasks based on the selected criteria and order
  const sortTasks = (tasks, sortBy, sortOrder) => {
    let sortedTasks = [...tasks];
    if (sortBy === 'priority') {
      sortedTasks.sort((a, b) => {
        const priorityOrder = { High: 3, Medium: 2, Low: 1 };
        return sortOrder === 'asc'
          ? priorityOrder[a.priority] - priorityOrder[b.priority]
          : priorityOrder[b.priority] - priorityOrder[a.priority];
      });
    } else if (sortBy === 'deadline') {
      sortedTasks.sort((a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return sortOrder === 'asc'
          ? new Date(a.deadline) - new Date(b.deadline)
          : new Date(b.deadline) - new Date(a.deadline);
      });
    }
    return sortedTasks;
  };

  const sortedTasks = sortTasks(tasks, sortBy, sortOrder);

  // Prepare data for the bar chart (count tasks by priority)
  const priorityData = sortedTasks.reduce(
    (acc, task) => {
      if (task.priority === 'High') acc.high += 1;
      if (task.priority === 'Medium') acc.medium += 1;
      if (task.priority === 'Low') acc.low += 1;
      return acc;
    },
    { high: 0, medium: 0, low: 0 }
  );

  const chartData = [
    { priority: 'High', Count: priorityData.high },
    { priority: 'Medium', Count: priorityData.medium },
    { priority: 'Low', Count: priorityData.low },
  ];

  return (
    <div className="task-tracker">
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
      <h1>Task Tracker</h1>

      {/* Task Input Section */}
      <div className="task-input">
        <input
          type="text"
          placeholder="Add a new task..."
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="priority-dropdown"
        >
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="deadline-input"
        />
        <button onClick={addTask}>Add Task</button>
      </div>

      {/* Task List Section */}
      <h3>Task List</h3> {/* Title for task list */}
      <table className="task-table">
        <thead>
          <tr>
            <th>Task</th>
            <th>
              Priority
              <div className="sorting-icons">
                <button onClick={() => { setSortBy('priority'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                  {sortBy === 'priority' ? (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                </button>
              </div>
            </th>
            <th>
              Deadline
              <div className="sorting-icons">
                <button onClick={() => { setSortBy('deadline'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                  {sortBy === 'deadline' ? (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                </button>
              </div>
            </th>
            <th>Mark as Done</th>
          </tr>
        </thead>
        <tbody>
          {sortedTasks.map((task) => {
            const taskPriority = task.priority ? task.priority.toLowerCase() : 'medium';
            return (
              <tr key={task.id} className={`task-row ${taskPriority} ${task.completed ? 'completed' : ''}`}>
                <td onClick={() => toggleCompletion(task.id)}>{task.text}</td>
                <td className={`priority-tag ${taskPriority}`}>{task.priority || 'Medium'}</td>
                <td>{task.deadline || 'N/A'}</td>
                <td>
                  <button onClick={() => deleteTask(task.id)}>X</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Bar Chart for Tasks by Priority */}
      <div className="analytics">
        <h3>Tasks by Priority</h3> {/* Title for bar chart */}
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="priority" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TaskTracker;
