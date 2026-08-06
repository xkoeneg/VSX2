import { memo } from 'react';

export const FunkyBear = memo(function FunkyBear() {
  return (
    <div className="funky-bear-wrap" aria-hidden="true">
      <style>{`
        .funky-bear-wrap { width: 76px; height: 76px; }
        .funky-bear-wrap svg { width: 100%; height: 100%; overflow: visible; }
        .funky-bear-body {
          transform-box: fill-box;
          transform-origin: 50% 100%;
          animation: funky-bear-hip 0.85s ease-in-out infinite;
        }
        .funky-bear-head {
          transform-box: fill-box;
          transform-origin: 50% 100%;
          animation: funky-bear-head-bop 0.85s ease-in-out infinite;
        }
        .funky-bear-arm-l {
          transform-box: fill-box;
          transform-origin: 50% 0%;
          animation: funky-bear-arm-l 0.85s ease-in-out infinite;
        }
        .funky-bear-arm-r {
          transform-box: fill-box;
          transform-origin: 50% 0%;
          animation: funky-bear-arm-r 0.85s ease-in-out infinite;
        }
        .funky-bear-leg-l {
          transform-box: fill-box;
          transform-origin: 50% 0%;
          animation: funky-bear-step-l 0.85s ease-in-out infinite;
        }
        .funky-bear-leg-r {
          transform-box: fill-box;
          transform-origin: 50% 0%;
          animation: funky-bear-step-r 0.85s ease-in-out infinite;
        }
        @keyframes funky-bear-hip {
          0%, 100% { transform: translateX(-5px) rotate(-7deg); }
          50% { transform: translateX(5px) rotate(7deg); }
        }
        @keyframes funky-bear-head-bop {
          0%, 100% { transform: translateX(-2px) rotate(-4deg); }
          50% { transform: translateX(2px) rotate(4deg); }
        }
        @keyframes funky-bear-arm-l {
          0%, 100% { transform: rotate(-16deg); }
          50% { transform: rotate(24deg); }
        }
        @keyframes funky-bear-arm-r {
          0%, 100% { transform: rotate(16deg); }
          50% { transform: rotate(-24deg); }
        }
        @keyframes funky-bear-step-l {
          0%, 55%, 100% { transform: translate(0, 0); }
          27% { transform: translate(-9px, -5px); }
        }
        @keyframes funky-bear-step-r {
          0%, 55%, 100% { transform: translate(0, 0); }
          82% { transform: translate(9px, -5px); }
        }
      `}</style>
      <svg viewBox="0 0 100 100">
        {/* Feet — alternating step-touch */}
        <g className="funky-bear-leg-l">
          <ellipse cx="39" cy="87" rx="9" ry="6.5" fill="#6b3f26" />
        </g>
        <g className="funky-bear-leg-r">
          <ellipse cx="61" cy="87" rx="9" ry="6.5" fill="#6b3f26" />
        </g>

        {/* Torso group sways at the hips; arms + head are nested so they move together */}
        <g className="funky-bear-body">
          <ellipse cx="50" cy="63" rx="21" ry="19" fill="#a5652f" />
          <ellipse cx="50" cy="68" rx="11" ry="9" fill="#e8c9a0" />

          <g className="funky-bear-arm-l">
            <ellipse cx="73" cy="50" rx="6.5" ry="15" fill="#a5652f" />
          </g>
          <g className="funky-bear-arm-r">
            <ellipse cx="27" cy="50" rx="6.5" ry="15" fill="#a5652f" />
          </g>

          <g className="funky-bear-head">
            <ellipse cx="38" cy="19" rx="5.5" ry="5.5" fill="#a5652f" />
            <ellipse cx="62" cy="19" rx="5.5" ry="5.5" fill="#a5652f" />
            <ellipse cx="50" cy="31" rx="17" ry="15" fill="#a5652f" />
            <ellipse cx="50" cy="35" rx="8.5" ry="6.5" fill="#e8c9a0" />
            <circle cx="45.5" cy="27" r="1.9" fill="#2b1a0f" />
            <circle cx="54.5" cy="27" r="1.9" fill="#2b1a0f" />
            <ellipse cx="50" cy="36" rx="2.2" ry="1.8" fill="#2b1a0f" />
          </g>
        </g>
      </svg>
    </div>
  );
});

