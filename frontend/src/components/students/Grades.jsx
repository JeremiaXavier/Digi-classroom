import React from 'react';

const Grades = () => {
  const grades = [
    { id: 1, subject: 'Mathematics', score: '85%' },
    { id: 2, subject: 'Science', score: '92%' },
    { id: 3, subject: 'History', score: '78%' },
    // Add more grades as needed
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Grades</h2>
      <ul className="space-y-2">
        {grades.map((grade) => (
          <li key={grade.id} className="p-4 bg-white shadow rounded cursor-pointer hover:bg-gray-100">
            <h3 className="text-lg font-semibold">{grade.subject}</h3>
            <p className="text-gray-600 text-sm">Score: {grade.score}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Grades;
