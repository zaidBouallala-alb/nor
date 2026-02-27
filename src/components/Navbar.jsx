import { NavLink } from 'react-router-dom'

const Navbar = () => {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <NavLink
          to="/"
          className="text-lg font-bold leading-none text-emerald-800 transition hover:text-emerald-600"
        >
          <span className="flex items-center gap-2"><img src="/logo.svg" alt="" className="h-6 w-6" /> نُور</span>
        </NavLink>
      </div>
    </header>
  )
}

export default Navbar
