import React from 'react';

const Assignments = () => {
  const assignments = [
    { id: 1, title: 'Math Homework 1', dueDate: '2025-01-20' },
    { id: 2, title: 'Science Project', dueDate: '2025-01-25' },
    { id: 3, title: 'History Essay', dueDate: '2025-02-10' },
    // Add more assignments as needed
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Assignments</h2>
      <ul className="space-y-2">
        {assignments.map((assignment) => (
          <li key={assignment.id} className="p-4 bg-white shadow rounded cursor-pointer hover:bg-gray-100">
            <h3 className="text-lg font-semibold">{assignment.title}</h3>
            <p className="text-gray-600 text-sm">Due: {assignment.dueDate}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Assignments;
