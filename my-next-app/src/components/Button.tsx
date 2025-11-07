//generall use for buttons in the system

interface ButtonProps {
    label: string;
    onClick?: () => void;
    type?: "button" | "submit";
    disabled?: boolean;
}

export default function Button({label, onClick, type = "button", disabled = false,}: ButtonProps) {
    return (
        <button
            type= {type}
            onClick={onClick}
            disabled={disabled}
            className={`w-full py-2 px-4 rounded-lg font-medium text-white transition
        ${disabled // in case button is unclickabe
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"}
      `}
        >
            {label}
        </button>
    );
}
