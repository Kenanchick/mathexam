export const MathBg = () => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-[40px] top-[36px] text-300 animate-math-float-slow">
        <svg width="220" height="54" viewBox="0 0 220 54" fill="none">
          <text
            x="0"
            y="34"
            fontSize="30"
            fontWeight="500"
            fill="#2563eb"
            fontFamily="serif"
          >
            a² + b² = c²
          </text>
        </svg>
      </div>

      <div className="absolute left-[90px] top-[480px] text-55 animate-math-orbit">
        <svg width="260" height="54" viewBox="0 0 260 54" fill="none">
          <text
            x="0"
            y="34"
            fontSize="28"
            fontWeight="500"
            fill="#2563eb"
            fontFamily="serif"
          >
            sin²α + cos²α = 1
          </text>
        </svg>
      </div>

      <div className="absolute right-[20px] top-[72px]  animate-math-float-delay">
        <svg width="180" height="54" viewBox="0 0 180 54" fill="none">
          <text
            x="0"
            y="34"
            fontSize="30"
            fontWeight="500"
            fill="#2563eb"
            fontFamily="serif"
          >
            D = b² − 4ac
          </text>
        </svg>
      </div>

      <div className="absolute right-[430px] bottom-[26px] animate-math-float-slow">
        <svg width="200" height="46" viewBox="0 0 200 46" fill="none">
          <text
            x="0"
            y="28"
            fontSize="24"
            fontWeight="500"
            fill="#2563eb"
            fontFamily="serif"
          >
            ax² + bx + c = 0
          </text>
        </svg>
      </div>

      <div className="absolute right-[1200px] bottom-[20px] animate-math-float">
        <svg width="330" height="330" viewBox="0 0 330 330" fill="none">
          <line
            x1="165"
            y1="24"
            x2="165"
            y2="306"
            stroke="#2563eb"
            strokeWidth="1.8"
            opacity="0.9"
          />
          <line
            x1="24"
            y1="165"
            x2="306"
            y2="165"
            stroke="#2563eb"
            strokeWidth="1.8"
            opacity="0.9"
          />

          <path
            d="M165 24 L160 34 M165 24 L170 34"
            stroke="#2563eb"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M306 165 L296 160 M306 165 L296 170"
            stroke="#2563eb"
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          <circle
            cx="165"
            cy="165"
            r="108"
            stroke="#2563eb"
            strokeWidth="2.2"
            strokeDasharray="5 5"
            opacity="0.85"
          />

          <line
            x1="165"
            y1="165"
            x2="241"
            y2="89"
            stroke="#2563eb"
            strokeWidth="2.3"
            opacity="0.95"
          />

          <line
            x1="241"
            y1="89"
            x2="241"
            y2="165"
            stroke="#2563eb"
            strokeWidth="1.4"
            opacity="0.5"
          />
          <line
            x1="241"
            y1="89"
            x2="165"
            y2="89"
            stroke="#2563eb"
            strokeWidth="1.4"
            opacity="0.5"
          />

          <path
            d="M195 165 A30 30 0 0 0 186 144"
            stroke="#2563eb"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <circle cx="273" cy="165" r="4" fill="#2563eb" />
          <circle cx="165" cy="57" r="4" fill="#2563eb" />
          <circle cx="57" cy="165" r="4" fill="#2563eb" />
          <circle cx="165" cy="273" r="4" fill="#2563eb" />

          <circle cx="258.5" cy="111" r="3.5" fill="#2563eb" />
          <circle cx="241" cy="89" r="3.5" fill="#2563eb" />
          <circle cx="219" cy="71.5" r="3.5" fill="#2563eb" />

          <text
            x="312"
            y="170"
            fontSize="16"
            fill="currentColor"
            fontFamily="serif"
          >
            x
          </text>
          <text
            x="170"
            y="18"
            fontSize="16"
            fill="currentColor"
            fontFamily="serif"
          >
            y
          </text>

          <text
            x="280"
            y="158"
            fontSize="14"
            fill="currentColor"
            fontFamily="serif"
          >
            2π
          </text>
          <text
            x="173"
            y="48"
            fontSize="14"
            fill="currentColor"
            fontFamily="serif"
          >
            π/2
          </text>
          <text
            x="35"
            y="158"
            fontSize="14"
            fill="currentColor"
            fontFamily="serif"
          >
            π
          </text>
          <text
            x="170"
            y="293"
            fontSize="14"
            fill="currentColor"
            fontFamily="serif"
          >
            3π/2
          </text>

          <text
            x="197"
            y="150"
            fontSize="15"
            fill="currentColor"
            fontFamily="serif"
          >
            α
          </text>

          <text
            x="250"
            y="104"
            fontSize="12"
            fill="#2563eb"
            fontFamily="serif"
          ></text>
          <text
            x="230"
            y="82"
            fontSize="12"
            fill="currentColor"
            fontFamily="serif"
          ></text>
          <text
            x="205"
            y="62"
            fontSize="12"
            fill="currentColor"
            fontFamily="serif"
          ></text>

          <text
            x="276"
            y="182"
            fontSize="12"
            fill="currentColor"
            fontFamily="serif"
          ></text>
          <text
            x="175"
            y="52"
            fontSize="12"
            fill="currentColor"
            fontFamily="serif"
          ></text>
        </svg>
      </div>
    </div>
  );
};
