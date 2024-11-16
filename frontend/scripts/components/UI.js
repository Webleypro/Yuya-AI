// components/UI.js
const Button = ({ children, ...props }) => (
    <button className="button" {...props}>
        {children}
    </button>
);

const Input = ({ ...props }) => (
    <input className="input" {...props} />
);