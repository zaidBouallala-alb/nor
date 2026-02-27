const AppContainer = ({ children, className = '' }) => {
  return (
    <div className={`mx-auto w-full max-w-content px-4 sm:px-5 lg:px-6 ${className}`}>
      {children}
    </div>
  )
}

export default AppContainer
