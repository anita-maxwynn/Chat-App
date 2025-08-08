import { Link } from 'react-router-dom';
import Logout from './Logout';

const Nav = () => {
  const isAuthenticated = !!localStorage.getItem('access_token');

  return (
    <nav className="bg-blue-900 border-b-2 border-yellow-400 p-4 flex items-center space-x-6 text-gray-100 fixed top-0 w-full">
      <Link
        to="/"
        className="hover:text-yellow-400 font-semibold transition"
      >
        Home
      </Link>

      {isAuthenticated ? (
        <>
          <Link
            to="/dashboard"
            className="hover:text-yellow-400 font-semibold transition"
          >
            Dashboard
          </Link>
          <Logout />
        </>
      ) : (
        <>
          <Link
            to="/login"
            className="hover:text-yellow-400 font-semibold transition"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="hover:text-yellow-400 font-semibold transition"
          >
            Signup
          </Link>
        </>
      )}
    </nav>
  );
};

export default Nav;
