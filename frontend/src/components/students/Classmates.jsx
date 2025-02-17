import React from 'react';

const Classmates = () => {
  const classmates = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
    { id: 3, name: 'Robert Brown' },
    // Add more classmates as needed
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Classmates</h2>
      <ul className="space-y-2">
        {classmates.map((classmate) => (
          <li key={classmate.id} className="p-4 bg-white shadow rounded cursor-pointer hover:bg-gray-100">
            <p className="text-lg font-semibold">{classmate.name}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Classmates;
