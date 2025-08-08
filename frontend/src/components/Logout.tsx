const Logout = () => {
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/'; // or router.navigate
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-yellow-400 text-blue-900 font-semibold px-4 py-2 rounded-lg hover:bg-yellow-500 transition"
      aria-label="Logout"
      title="Logout"
    >
      Logout
    </button>
  );
};

export default Logout;
