// components/ClassroomDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const ClassroomDetails = () => {
  const { id } = useParams();  // Extract ID from the URL
  const [classroom, setClassroom] = useState(null);



  if (!classroom) {
    return <div>Loading classroom details...</div>;
  }

  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold">{classroom.name}</h2>
      <p className="mt-2">{classroom.description}</p>
    </div>
  );
};

export default ClassroomDetails;
