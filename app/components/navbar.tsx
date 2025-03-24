import { NavLink } from "react-router";

const Navbar = () => {
  return (
    <header className="w-full px-8 text-gray-700 bg-white shadow-sm">
      <div className="p-4 lg:px-6">
        <div className="flex items-center justify-between">
          <NavLink to="/" className="font-semibold space-x-1">
            <span className="text-gray-900">Rest</span>
            <span className="text-blue-500">Explore</span>
          </NavLink>

          <nav className="flex gap-4">
            <NavLink to="/" className={({ isActive }) =>
              isActive ? "text-blue-500 font-medium" : "text-gray-500"
            }>Home</NavLink>
            <NavLink to="/about" className={({ isActive }) =>
              isActive ? "text-blue-500 font-medium" : "text-gray-500"
            }>About</NavLink>
            <NavLink to="/countries" className={({ isActive }) =>
              isActive ? "text-blue-500 font-medium" : "text-gray-500"
            } end>Countries</NavLink>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Navbar;