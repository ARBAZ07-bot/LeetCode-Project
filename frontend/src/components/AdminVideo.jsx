import { useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient'
import { NavLink } from 'react-router';

const AdminVideo = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);


  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get('/problem/getAllProblem');
      setProblems(data);
    } catch (err) {
      setError('Failed to fetch problems');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;

    try {
      await axiosClient.delete(`/video/delete/${id}`);
      setSuccessMessage('Video deleted successfully. The problem itself is unaffected.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to delete video');
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Video Upload and Delete</h1>
      </div>

      {successMessage && (
        <div className="alert alert-success shadow-lg mb-4">
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error shadow-lg mb-4">
          <span>{error}</span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th className="w-1/12">#</th>
              <th className="w-4/12">Title</th>
              <th className="w-2/12">Difficulty</th>
              <th className="w-3/12">Tags</th>
              <th className="w-2/12">Actions</th>
            </tr>
          </thead>
          <tbody>
            {problems.map((problem, index) => (
              <tr key={problem._id}>
                <th>{index + 1}</th>
                <td>{problem.title}</td>
                <td>
                  <span className={`badge ${
                    problem.difficulty === 'easy'
                      ? 'badge-success'
                      : problem.difficulty === 'medium'
                        ? 'badge-warning'
                        : 'badge-error'
                  }`}>
                    {problem.difficulty}
                  </span>
                </td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {problem.tags?.map((tag, i) => (
                      <span key={i} className="badge badge-outline badge-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <div className="flex gap-2">
                    <NavLink
                      to={`/admin/upload/${problem._id}`}
                      className="btn btn-sm bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Upload
                    </NavLink>
                    <button
                      onClick={() => handleDelete(problem._id)}
                      className="btn btn-sm btn-error"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminVideo;