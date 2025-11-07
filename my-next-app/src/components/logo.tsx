// logo component to be put in other pages
import Image from "next/image";

interface LogoProps {
    size?: number;
    className?: string;
    onClick?: () => void;
}

export default function Logo({
                                 size = 80, // for width and height
                                 className = "",
                                 onClick,
                             }: LogoProps) {
    return (
        <div
            className={`flex items-center justify-center ${className}`}
            onClick={onClick}
        >
            <Image
                src="/logo.svg"
                alt="RegIx"
                width={size}
                height={size}
                priority
            />
        </div>
    );
}

