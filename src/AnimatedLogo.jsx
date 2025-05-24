// React Component with animation
function AuraIcon() {
  return (
    <svg
      width="50"
      height="50"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <defs>
        <style>
          {`
            .ring {
              stroke: #4F9D69;
              fill: none;
              stroke-width: 2;
              opacity: 0.4;
              transform-origin: center;
              animation: pulse 2s infinite ease-in-out;
            }

            .ring:nth-child(1) {
              r: 16;
              animation-delay: 0s;
              opacity: 0.7;
            }

            .ring:nth-child(2) {
              r: 20;
              animation-delay: 0.2s;
              opacity: 0.5;
            }

            .ring:nth-child(3) {
              r: 24;
              animation-delay: 0.4s;
              opacity: 0.3;
            }

            @keyframes pulse {
              0%, 100% {
                transform: scale(1);
                opacity: 0.4;
              }
              50% {
                transform: scale(1.15);
                opacity: 0.8;
              }
            }
          `}
        </style>
      </defs>

      <circle className="ring" cx="32" cy="32" r="16" />
      <circle className="ring" cx="32" cy="32" r="20" />
      <circle className="ring" cx="32" cy="32" r="24" />

      <circle cx="32" cy="32" r="4" fill="#4F9D69" />
    </svg>
  );
}

export default AuraIcon;