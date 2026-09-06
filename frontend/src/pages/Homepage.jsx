import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';
import ThemeToggle from '../components/ThemeToggle';
import { Code2, Search, ChevronRight, CheckCircle2 } from 'lucide-react';

function Homepage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all'
  });

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true);
        const { data } = await axiosClient.get('/problem/getAllProblem');
        setProblems(data);
      } catch (error) {
        console.error('Error fetching problems:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/problemSolvedByUser');
        setSolvedProblems(data);
      } catch (error) {
        console.error('Error fetching solved problems:', error);
      }
    };

    fetchProblems();
    if (user) fetchSolvedProblems();
  }, [user]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]);
  };

  const solvedIds = new Set(solvedProblems.map(sp => sp._id));

  const filteredProblems = problems.filter(problem => {
    const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
    const tagMatch = filters.tag === 'all' || problem.tags?.includes(filters.tag);
    const statusMatch = filters.status === 'all' || solvedIds.has(problem._id);
    const searchMatch = problem.title.toLowerCase().includes(search.toLowerCase());
    return difficultyMatch && tagMatch && statusMatch && searchMatch;
  });

  return (
    <div className="min-h-screen bg-base-200">
      {/* Navigation Bar */}
      <nav className="navbar bg-base-100 shadow-md px-4 sm:px-8 sticky top-0 z-10">
        <div className="flex-1">
          <NavLink to="/" className="btn btn-ghost text-xl font-bold text-primary gap-2">
            <Code2 size={22} />
            LeetCode
          </NavLink>
        </div>
        <div className="flex-none gap-2">
          <ThemeToggle />
          <div className="dropdown dropdown-end">
            <div tabIndex={0} className="btn btn-ghost gap-2">
              <div className="avatar placeholder">
                <div className="bg-primary text-primary-content rounded-full w-8">
                  <span className="text-sm">{user?.firstName?.[0]?.toUpperCase()}</span>
                </div>
              </div>
              <span className="hidden sm:inline">{user?.firstName}</span>
            </div>
            <ul className="mt-3 p-2 shadow-lg menu menu-sm dropdown-content bg-base-100 rounded-box w-52 border border-base-300">
              {user?.role === 'admin' && (
                <li><NavLink to="/admin">Admin Panel</NavLink></li>
              )}
              <li><button onClick={handleLogout} className="text-error">Logout</button></li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto p-4 sm:p-6">
        {/* Stats bar */}
        <div className="stats shadow-sm bg-base-100 mb-6 w-full">
          <div className="stat py-3">
            <div className="stat-title text-xs">Total Problems</div>
            <div className="stat-value text-2xl">{problems.length}</div>
          </div>
          <div className="stat py-3">
            <div className="stat-title text-xs">Solved</div>
            <div className="stat-value text-2xl text-success">{solvedProblems.length}</div>
          </div>
          <div className="stat py-3">
            <div className="stat-title text-xs">Remaining</div>
            <div className="stat-value text-2xl text-base-content/70">
              {Math.max(problems.length - solvedProblems.length, 0)}
            </div>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="card bg-base-100 shadow-sm mb-6">
          <div className="card-body p-4">
            <div className="flex flex-wrap gap-3">
              <label className="input input-bordered input-sm flex items-center gap-2 flex-1 min-w-[200px]">
                <Search size={16} className="text-base-content/40" />
                <input
                  type="text"
                  className="grow"
                  placeholder="Search problems..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>

              <select
                className="select select-bordered select-sm"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="all">All Problems</option>
                <option value="solved">Solved Problems</option>
              </select>

              <select
                className="select select-bordered select-sm"
                value={filters.difficulty}
                onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

              <select
                className="select select-bordered select-sm"
                value={filters.tag}
                onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
              >
                <option value="all">All Tags</option>
                <option value="array">Array</option>
                <option value="linkedList">Linked List</option>
                <option value="graph">Graph</option>
                <option value="dp">DP</option>
              </select>

              <div className="ml-auto text-sm text-base-content/60 self-center">
                {filteredProblems.length} problems
              </div>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center py-16">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredProblems.length === 0 && (
          <div className="text-center py-16 text-base-content/60">
            <p className="text-lg">No problems found</p>
            <p className="text-sm">Try changing your filters or search</p>
          </div>
        )}

        {/* Problems List */}
        {!loading && (
          <div className="grid gap-2">
            {filteredProblems.map(problem => (
              <NavLink
                to={`/problem/${problem._id}`}
                key={problem._id}
                className="group card bg-base-100 shadow-sm hover:shadow-md hover:border-primary/40 border border-transparent transition-all"
              >
                <div className="card-body p-4 flex-row items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    {solvedIds.has(problem._id) ? (
                      <CheckCircle2 size={18} className="text-success flex-shrink-0" />
                    ) : (
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${getDifficultyDot(problem.difficulty)}`} />
                    )}
                    <h2 className="font-medium truncate">{problem.title}</h2>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className={`badge badge-sm ${getDifficultyBadgeColor(problem.difficulty)}`}>
                      {problem.difficulty}
                    </div>
                    {problem.tags?.slice(0, 2).map((tag, i) => (
                      <div key={i} className="badge badge-sm badge-ghost hidden sm:flex">
                        {tag}
                      </div>
                    ))}
                    <ChevronRight
                      size={16}
                      className="text-base-content/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all"
                    />
                  </div>
                </div>
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const getDifficultyBadgeColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy': return 'badge-success';
    case 'medium': return 'badge-warning';
    case 'hard': return 'badge-error';
    default: return 'badge-neutral';
  }
};

const getDifficultyDot = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy': return 'bg-success';
    case 'medium': return 'bg-warning';
    case 'hard': return 'bg-error';
    default: return 'bg-neutral';
  }
};

export default Homepage;