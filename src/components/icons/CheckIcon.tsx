import type React from "react"

interface CheckIconProps {
    size?: number
    className?: string
}

const CheckIcon: React.FC<CheckIconProps> = ({ size = 24, className = "" }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="#88AB61" />
        </svg>
    )
}

export default CheckIcon