function GradientButton({ children, className = '', type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-full bg-brand-gradient px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-orange-500/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-red-500/20 focus:outline-none focus:ring-2 focus:ring-orange-300/50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default GradientButton;