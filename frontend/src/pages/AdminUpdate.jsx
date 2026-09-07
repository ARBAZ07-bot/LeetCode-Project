import { useState, useEffect } from 'react';
import { NavLink } from 'react-router';
import axiosClient from '../utils/axiosClient';
import { Edit, ChevronRight } from 'lucide-react';

function AdminUpdate() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/getAllProblem');
        setProblems(data);
      } catch (error) {
        console.error('Error fetching problems:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  const getDifficultyBadgeColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'badge-success';
      case 'medium': return 'badge-warning';
      case 'hard': return 'badge-error';
      default: return 'badge-neutral';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Update Problem</h1>
      <p className="text-base-content/60 mb-6">Select a problem to edit its details.</p>

      {loading && (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      )}

      {!loading && (
        <div className="grid gap-2">
          {problems.map((problem) => (
            <NavLink
              key={problem._id}
              to={`/admin/update/${problem._id}`}
              className="group card bg-base-100 shadow-sm hover:shadow-md hover:border-primary/40 border border-transparent transition-all"
            >
              <div className="card-body p-4 flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <Edit size={18} className="text-warning" />
                  <h2 className="font-medium">{problem.title}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`badge badge-sm ${getDifficultyBadgeColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </div>
                  <ChevronRight size={16} className="text-base-content/30 group-hover:text-primary transition-all" />
                </div>
              </div>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminUpdate;