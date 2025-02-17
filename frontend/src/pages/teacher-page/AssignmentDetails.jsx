import { useEffect, useState, useParams } from 'react';
import { axiosInstance } from '@/lib/axios.js';

function AssignmentDetails() {
    const [assignment, setAssignment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Assuming you pass an 'assignmentId' as a prop or from route params
    const { id } = useParams();

    useEffect(() => {
        // Fetch assignment details from the backend API
        const fetchAssignmentDetails = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get(`/api/assignments/${id}`);
                setAssignment(response.data);
                setLoading(false);
            } catch (err) {
                setError('Error fetching assignment details');
                console.log("not assignment is feetchedd");
                setLoading(false);
            }
        };

        fetchAssignmentDetails();
    }, [id]);

    if (loading) return <div className='flex flex-1 h-full w-full items-center justify-center'>Loading...</div>;
    if (error) return <div className='flex flex-1 h-full w-full items-center justify-center'>{error}</div>;

    return (
        <div className="p-4 bg-white rounded-md shadow-md">
            <h1 className="text-2xl font-semibold text-gray-800">{assignment?.title}</h1>
            <p className="text-gray-600 mt-2">{assignment?.description}</p>
            <div className="mt-4">
                <h2 className="text-lg font-medium text-gray-800">Due Date: {assignment?.dueDate}</h2>
                <h3 className="text-sm text-gray-600">Created by: {assignment?.createdBy}</h3>
            </div>
            {/* Add any additional assignment details here */}
        </div>
    );
}

export default AssignmentDetails;
