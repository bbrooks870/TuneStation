type P = { className?: string }
const base = (d: React.ReactNode, vb = "0 0 24 24") =>
  function Icon({ className = "h-5 w-5" }: P) {
    return (
      <svg viewBox={vb} className={className} fill="currentColor" aria-hidden="true">
        {d}
      </svg>
    )
  }

export const PlayIcon = base(<path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11.04-6.86a1 1 0 0 0 0-1.72L9.5 4.28A1 1 0 0 0 8 5.14Z" />)
export const PauseIcon = base(<path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />)
export const NextIcon = base(<path d="M6 6.5v11a1 1 0 0 0 1.55.83L15 13.2V17a1 1 0 0 0 2 0V7a1 1 0 0 0-2 0v3.8L7.55 5.67A1 1 0 0 0 6 6.5Z" />)
export const PrevIcon = base(<path d="M18 6.5v11a1 1 0 0 1-1.55.83L9 13.2V17a1 1 0 0 1-2 0V7a1 1 0 0 1 2 0v3.8l7.45-5.13A1 1 0 0 1 18 6.5Z" />)
export const DownloadIcon = base(
  <path d="M12 3a1 1 0 0 1 1 1v9.59l3.3-3.3a1 1 0 1 1 1.4 1.42l-5 5a1 1 0 0 1-1.4 0l-5-5a1 1 0 1 1 1.4-1.42l3.3 3.3V4a1 1 0 0 1 1-1ZM5 19a1 1 0 0 0 0 2h14a1 1 0 1 0 0-2H5Z" />,
)
export const SearchIcon = base(
  <path d="M10.5 3a7.5 7.5 0 0 1 5.96 12.05l4.25 4.24a1 1 0 0 1-1.42 1.42l-4.24-4.25A7.5 7.5 0 1 1 10.5 3Zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Z" />,
)
export const VolumeIcon = base(<path d="M4 9v6h4l5 4V5L8 9H4Zm12.5 3a4.5 4.5 0 0 0-2.5-4.03v8.05A4.5 4.5 0 0 0 16.5 12ZM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06a9 9 0 0 0 0-17.54Z" />)
export const MuteIcon = base(<path d="M4 9v6h4l5 4V5L8 9H4Zm12.6 3 2.7-2.7-1.4-1.4-2.7 2.7-2.7-2.7-1.4 1.4 2.7 2.7-2.7 2.7 1.4 1.4 2.7-2.7 2.7 2.7 1.4-1.4-2.7-2.7Z" />)
export const HeartIcon = ({ filled = false, className = "h-5 w-5" }: P & { filled?: boolean }) => (
  <svg viewBox="0 0 24 24" className={className} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? "0" : "2"} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
  </svg>
)

export const SpinnerIcon = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={`${className} animate-spin`} fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
)
export const EqIcon = ({ className = "h-4 w-4" }: P) => (
  <span className={`${className} inline-flex items-end gap-[2px]`} aria-hidden="true">
    <span className="eq-bar w-[3px] bg-current" />
    <span className="eq-bar w-[3px] bg-current [animation-delay:.2s]" />
    <span className="eq-bar w-[3px] bg-current [animation-delay:.4s]" />
  </span>
)
