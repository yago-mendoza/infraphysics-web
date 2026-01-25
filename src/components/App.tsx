import React, { useState, useMemo, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate, useParams, Navigate } from 'react-router-dom';
import { posts } from '../data/data';
import { Post, Category } from '../types';

// --- ICONS ---
const Logo: React.FC<{ className?: string; color?: string }> = ({ className, color }) => (
  <svg
    viewBox="0 0 992 1072"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill={color || "currentColor"}
  >
    <path d="M415.807 89.113 C 431.038 97.975,449.451 108.662,456.725 112.863 L 469.950 120.500 469.975 425.750 C 469.989 593.638,470.298 731.000,470.662 731.000 C 471.026 731.000,473.164 729.942,475.412 728.648 C 512.430 707.353,539.111 691.750,540.889 690.360 C 541.103 690.192,541.192 571.688,541.087 427.016 C 540.982 282.345,541.166 163.540,541.496 163.006 C 541.843 162.446,543.660 163.018,545.798 164.360 C 547.834 165.639,559.625 172.540,572.000 179.697 C 584.375 186.853,599.000 195.313,604.500 198.498 C 621.902 208.573,638.895 218.392,659.000 229.989 C 698.456 252.748,711.324 260.175,750.000 282.514 C 771.725 295.062,799.400 311.031,811.500 318.001 C 823.600 324.971,842.275 335.781,853.000 342.022 C 863.725 348.263,875.754 355.199,879.731 357.435 L 886.962 361.500 886.731 505.850 L 886.500 650.201 868.000 660.952 C 857.825 666.865,838.700 677.914,825.500 685.506 C 812.300 693.098,797.450 701.680,792.500 704.576 C 787.550 707.473,765.950 719.936,744.500 732.274 C 723.050 744.611,701.000 757.376,695.500 760.641 L 685.500 766.578 685.000 810.449 L 684.500 854.320 661.500 867.806 C 648.850 875.222,620.725 891.733,599.000 904.495 C 546.892 935.107,542.992 937.325,542.372 936.705 C 542.081 936.415,541.608 916.900,541.319 893.339 C 541.031 869.777,540.659 850.355,540.493 850.179 C 540.119 849.781,534.574 852.926,495.500 875.696 C 478.450 885.632,450.484 901.892,433.354 911.830 L 402.208 929.898 372.604 912.791 L 343.000 895.684 343.000 854.842 C 343.000 829.508,343.363 814.000,343.957 814.000 C 344.926 814.000,352.101 817.198,386.659 833.030 C 397.197 837.858,406.759 842.106,407.909 842.471 C 409.972 843.126,410.000 842.915,410.002 826.817 C 410.002 817.843,410.300 795.317,410.663 776.760 L 411.323 743.021 400.412 737.908 C 394.410 735.096,379.600 728.294,367.500 722.792 C 355.400 717.290,344.928 712.324,344.230 711.755 C 342.630 710.453,342.894 670.382,344.500 670.695 C 345.050 670.802,355.400 675.449,367.500 681.021 C 395.300 693.823,415.670 703.000,416.286 703.000 C 416.549 703.000,417.066 681.962,417.435 656.250 C 417.805 630.538,418.309 608.015,418.556 606.200 C 418.968 603.173,418.694 602.770,415.252 601.334 C 405.840 597.407,345.364 569.668,344.250 568.767 C 343.328 568.020,343.000 562.660,343.000 548.310 C 343.000 529.003,343.015 528.870,345.103 529.533 C 346.260 529.900,363.878 537.812,384.254 547.116 C 404.630 556.420,421.429 563.905,421.584 563.749 C 421.808 563.525,423.500 477.811,423.500 466.666 C 423.500 463.938,422.636 463.440,400.500 453.399 C 387.850 447.662,373.675 441.201,369.000 439.041 C 364.325 436.882,356.550 433.313,351.722 431.109 L 342.945 427.104 343.001 340.802 C 343.032 293.336,343.045 254.180,343.029 253.789 C 343.002 253.125,325.140 263.241,282.750 287.927 L 265.000 298.264 265.000 344.632 C 265.000 371.470,264.621 391.000,264.099 391.000 C 263.604 391.000,259.216 389.141,254.349 386.869 C 249.482 384.597,221.425 371.749,192.000 358.319 C 162.575 344.889,137.488 333.237,136.250 332.427 L 134.000 330.954 134.000 275.599 C 134.000 232.526,134.277 220.019,135.250 219.226 C 135.938 218.666,152.025 209.222,171.000 198.239 C 189.975 187.256,209.775 175.783,215.000 172.743 C 220.225 169.704,237.550 159.662,253.500 150.428 C 280.963 134.530,294.231 126.868,340.000 100.477 C 350.725 94.293,365.800 85.592,373.500 81.141 C 381.200 76.690,387.638 73.038,387.807 73.024 C 387.975 73.011,400.575 80.251,415.807 89.113 M685.000 502.500 C 685.000 584.656,685.258 605.991,686.250 605.957 C 686.938 605.934,701.450 597.900,718.500 588.105 L 749.500 570.295 749.757 502.737 L 750.014 435.180 733.757 425.753 C 701.753 407.194,687.151 399.000,686.084 399.000 C 685.312 399.000,685.000 428.815,685.000 502.500 M162.650 446.362 C 195.576 461.522,254.964 488.604,260.750 491.098 L 265.000 492.929 265.000 512.464 C 265.000 525.616,264.652 532.000,263.935 532.000 C 261.898 532.000,136.492 474.744,135.318 473.278 C 134.466 472.215,134.262 466.724,134.589 453.651 C 134.839 443.668,135.034 435.163,135.022 434.750 C 135.010 434.337,135.180 434.000,135.400 434.000 C 135.620 434.000,147.882 439.563,162.650 446.362 M338.633 462.630 C 346.317 466.276,349.394 478.266,344.734 486.396 C 337.659 498.737,318.656 494.978,316.352 480.782 C 314.142 467.165,326.674 456.955,338.633 462.630 M387.996 484.118 C 395.320 488.234,398.262 498.992,394.248 506.980 C 388.812 517.801,373.011 517.751,367.196 506.895 C 359.471 492.475,374.189 476.358,387.996 484.118 M184.709 598.103 C 211.544 610.260,240.475 623.447,249.000 627.406 L 264.500 634.606 264.770 655.303 C 264.919 666.686,264.831 676.000,264.575 676.000 C 264.318 676.000,255.872 672.220,245.804 667.601 C 196.486 644.971,166.178 631.158,153.000 625.303 C 131.653 615.818,133.909 619.106,134.411 598.222 C 134.963 575.219,134.926 576.000,135.459 576.000 C 135.711 576.000,157.873 585.947,184.709 598.103 M334.913 602.769 C 341.868 607.918,344.129 617.526,340.148 625.016 C 334.562 635.528,319.495 635.819,313.466 625.532 C 308.052 616.294,312.755 603.360,322.500 600.684 C 325.973 599.731,332.229 600.781,334.913 602.769 M383.913 623.769 C 390.996 629.013,393.349 639.635,389.005 646.759 C 381.226 659.519,361.629 654.444,360.295 639.324 C 359.128 626.096,373.909 616.361,383.913 623.769 M191.500 744.506 C 219.000 757.025,246.450 769.499,252.500 772.226 C 258.550 774.953,263.843 777.509,264.263 777.905 C 264.682 778.301,264.907 794.649,264.763 814.234 L 264.500 849.842 250.000 841.606 C 242.025 837.076,218.400 823.538,197.500 811.521 C 176.600 799.504,154.325 786.762,148.000 783.206 C 141.675 779.649,135.984 776.101,135.354 775.321 C 134.142 773.821,133.350 721.862,134.510 719.985 C 135.246 718.793,131.023 716.976,191.500 744.506 M327.497 741.903 C 332.480 744.739,335.000 749.473,335.000 756.000 C 335.000 765.453,328.753 772.109,319.752 772.245 C 302.097 772.512,297.782 746.420,314.500 740.485 C 318.951 738.904,323.003 739.347,327.497 741.903 M376.802 763.702 C 381.982 767.569,383.500 770.696,383.500 777.500 C 383.500 782.357,383.014 784.504,381.438 786.615 C 376.205 793.624,368.405 795.778,361.329 792.168 C 349.317 786.040,349.995 768.000,362.450 762.352 C 366.388 760.567,373.499 761.236,376.802 763.702 " fillRule="evenodd"/>
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

// Material Icons - Industrial Style
const GitHubIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

const ExternalLinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15 3 21 3 21 9"></polyline>
    <line x1="10" y1="14" x2="21" y2="3"></line>
  </svg>
);

const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
  </svg>
);

const TagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
    <line x1="7" y1="7" x2="7.01" y2="7"></line>
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const LinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
  </svg>
);

const BookmarkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
  </svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const CircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="6"></circle>
  </svg>
);

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

const GridIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

const ListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"></line>
    <line x1="8" y1="12" x2="21" y2="12"></line>
    <line x1="8" y1="18" x2="21" y2="18"></line>
    <line x1="3" y1="6" x2="3.01" y2="6"></line>
    <line x1="3" y1="12" x2="3.01" y2="12"></line>
    <line x1="3" y1="18" x2="3.01" y2="18"></line>
  </svg>
);

// Status Badge Component
const StatusBadge: React.FC<{ status: 'active' | 'completed' | 'archived' | 'in-progress' }> = ({ status }) => {
  const statusConfig = {
    'active': { color: 'bg-emerald-500', text: 'Active', icon: <CircleIcon /> },
    'completed': { color: 'bg-blue-500', text: 'Completed', icon: <CheckCircleIcon /> },
    'archived': { color: 'bg-gray-400', text: 'Archived', icon: <CircleIcon /> },
    'in-progress': { color: 'bg-amber-500', text: 'In Progress', icon: <CircleIcon /> }
  };

  const config = statusConfig[status] || statusConfig['active'];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-white rounded-sm ${config.color}`}>
      {config.icon}
      {config.text}
    </span>
  );
};

// --- UTILS ---
const calculateReadingTime = (content: string) => {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

// Format date to readable format (Jan 15, 2024)
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// Format date to compact format (Jan 15)
const formatDateCompact = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

// Format relative time (2 days ago, etc.)
const formatRelativeTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

// Dual Grid Component - fixed background, snuggly fit between navbar and footer
const DualGrid: React.FC<{ sidebarWidth: number }> = ({ sidebarWidth }) => {
  const [gridSize, setGridSize] = useState({ largeCellSize: 80, smallCellSize: 8 });

  useEffect(() => {
    const calculateGrid = () => {
      // Available width = viewport width minus sidebar
      const availableWidth = window.innerWidth - sidebarWidth;
      const availableHeight = window.innerHeight;

      // Calculate cell size to fit perfectly in both dimensions
      // Find a cell size that divides both width and height as evenly as possible
      const targetCellSize = 80; // approximate target

      // Calculate how many cells fit in width and height
      const cellsInWidth = Math.round(availableWidth / targetCellSize);
      const cellsInHeight = Math.round(availableHeight / targetCellSize);

      // Use the size that creates a perfect fit for width (primary constraint)
      const largeCellSize = availableWidth / cellsInWidth;
      const smallCellSize = largeCellSize / 10;

      setGridSize({ largeCellSize, smallCellSize });
    };

    calculateGrid();
    window.addEventListener('resize', calculateGrid);
    return () => window.removeEventListener('resize', calculateGrid);
  }, [sidebarWidth]);

  return (
    <div
      className="fixed top-0 bottom-0 right-0 pointer-events-none z-0"
      style={{ left: sidebarWidth }}
    >
      {/* Small grid (fine rhythm - 10x10 inside each large cell) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e8e8e8 1px, transparent 1px),
            linear-gradient(to bottom, #e8e8e8 1px, transparent 1px)
          `,
          backgroundSize: `${gridSize.smallCellSize}px ${gridSize.smallCellSize}px`,
          backgroundPosition: '0 0',
        }}
      />
      {/* Large grid (main rhythm) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #dcdcdc 1px, transparent 1px),
            linear-gradient(to bottom, #dcdcdc 1px, transparent 1px)
          `,
          backgroundSize: `${gridSize.largeCellSize}px ${gridSize.largeCellSize}px`,
          backgroundPosition: '0 0',
        }}
      />
    </div>
  );
};

// Component to Highlight Text
const Highlight: React.FC<{ text: string; query: string; className?: string }> = ({ text, query, className }) => {
  if (!query) return <span className={className}>{text}</span>;
  
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <span className={className}>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() ? 
          <span key={i} className="bg-yellow-200 text-black px-0.5 rounded-sm">{part}</span> : 
          part
      )}
    </span>
  );
};

// --- COMPONENTS ---

// Chevron Icon for dropdowns
const ChevronIcon: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
  >
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

// Home Icon (bigger)
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

// Sidebar Icons - monoline, thin stroke (~1.25px)
const GearIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

const ThreadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const GradCapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
    <path d="M6 12v5c0 1.5 2.5 3 6 3s6-1.5 6-3v-5"></path>
  </svg>
);

const DiamondIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
    <rect x="12" y="1" width="15.56" height="15.56" rx="2" transform="rotate(45 12 1)"></rect>
  </svg>
);

// LinkedIn Icon
const LinkedInIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

// Twitter/X Icon
const TwitterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

// 1. Sidebar Navigation - Industrial Professional Style
const Sidebar: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  // Colors
  const iconColor = "#9AA0A6";
  const textColor = "#E8EAED";
  const activeTextColor = "#FFFFFF";
  const hoverBg = "rgba(255,255,255,0.05)";
  const activeBg = "rgba(59, 130, 246, 0.15)";
  const activeAccent = "#3B82F6";

  return (
    <aside
      className="hidden md:flex flex-col w-36 flex-shrink-0 sticky top-0 h-screen py-6 px-3 z-40"
      style={{ backgroundColor: '#2D2D2D'}}>

      {/* Logo */}
      <Link
        to="/home"
        className="flex justify-center mb-10 mt-6 group">
        <div className="w-10 h-10 transition-transform group-hover:scale-110">
          <Logo color={textColor} />
        </div>
      </Link>

      {/* Home */}
      <Link
        to="/home"
        className={`flex flex-col items-center gap-1.5 py-3 mb-2 rounded-sm transition-all ${isActive("/home") ? 'font-medium' : 'opacity-80 hover:opacity-100'}`}
        style={{
          color: isActive("/home") ? activeTextColor : textColor,
          backgroundColor: isActive("/home") ? activeBg : 'transparent'
        }}>
        <span style={{ color: isActive("/home") ? activeAccent : iconColor }}><HomeIcon /></span>
        <span className="text-[11px]">home</span>
      </Link>

      {/* Divider */}
      <div className="w-8 h-px bg-gray-600 mx-auto my-3"></div>

      {/* Categories */}
      <nav className="flex flex-col gap-1">
        <Link
          to="/projects"
          className={`flex flex-col items-center gap-1.5 py-3 rounded-sm transition-all ${isActive("/projects") ? 'font-medium' : 'opacity-80 hover:opacity-100'}`}
          style={{
            color: isActive("/projects") ? activeTextColor : textColor,
            backgroundColor: isActive("/projects") ? activeBg : 'transparent'
          }}>
          <span style={{ color: isActive("/projects") ? '#10B981' : iconColor }}><GearIcon /></span>
          <span className="text-[11px]">projects</span>
        </Link>

        <Link
          to="/threads"
          className={`flex flex-col items-center gap-1.5 py-3 rounded-sm transition-all ${isActive("/threads") ? 'font-medium' : 'opacity-80 hover:opacity-100'}`}
          style={{
            color: isActive("/threads") ? activeTextColor : textColor,
            backgroundColor: isActive("/threads") ? activeBg : 'transparent'
          }}>
          <span style={{ color: isActive("/threads") ? '#F59E0B' : iconColor }}><ThreadIcon /></span>
          <span className="text-[11px]">threads</span>
        </Link>

        <Link
          to="/bits2bricks"
          className={`flex flex-col items-center gap-1.5 py-3 rounded-sm transition-all ${isActive("/bits2bricks") ? 'font-medium' : 'opacity-80 hover:opacity-100'}`}
          style={{
            color: isActive("/bits2bricks") ? activeTextColor : textColor,
            backgroundColor: isActive("/bits2bricks") ? activeBg : 'transparent'
          }}>
          <span style={{ color: isActive("/bits2bricks") ? '#3B82F6' : iconColor }}><GradCapIcon /></span>
          <span className="text-[11px]">bits2bricks</span>
        </Link>
      </nav>

      {/* Spacer */}
      <div className="flex-grow"></div>

      {/* Second Brain - Bottom Section */}
      <Link
        to="/second-brain"
        className={`flex flex-col items-center gap-1.5 py-3 rounded-sm transition-all ${
          isActive("/second-brain") ? 'font-medium' : 'opacity-80 hover:opacity-100'
        }`}
        style={{
          color: isActive("/second-brain") ? activeTextColor : textColor,
          backgroundColor: isActive("/second-brain") ? activeBg : 'transparent'
        }}
      >
        <span style={{ color: isActive("/second-brain") ? activeAccent : iconColor }}><DiamondIcon /></span>
        <span className="text-[11px]">notes</span>
      </Link>

      {/* Divider */}
      <div className="w-8 h-px bg-gray-600 mx-auto my-3"></div>

      {/* Social Links */}
      <div className="flex justify-center gap-2 mb-4">
        <a
          href="https://github.com/yago"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-sm transition-all"
          aria-label="GitHub"
        >
          <GitHubIcon />
        </a>
        <a
          href="https://linkedin.com/in/yago"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-gray-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-sm transition-all"
          aria-label="LinkedIn"
        >
          <LinkedInIcon />
        </a>
        <a
          href="https://x.com/yago"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-sm transition-all"
          aria-label="Twitter/X"
        >
          <TwitterIcon />
        </a>
      </div>
    </aside>
  );
};

// Mobile Navigation - Professional Industrial Style
const MobileNav: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleRandom = () => {
    const validPosts = posts.filter(p => p.category !== 'fieldnotes');
    if (validPosts.length === 0) return;
    const randomIndex = Math.floor(Math.random() * validPosts.length);
    const randomPost = validPosts[randomIndex];
    navigate(`/${randomPost.category}/${randomPost.id}`);
    setIsOpen(false);
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const NavLink = ({ to, colorClass, icon, children }: { to: string, colorClass: string, icon: React.ReactNode, children: React.ReactNode }) => (
    <Link
      to={to}
      onClick={() => setIsOpen(false)}
      className={`flex items-center gap-3 py-3 px-4 rounded-sm transition-all ${
        isActive(to) ? colorClass + ' bg-gray-50 font-medium' : 'text-gray-500 hover:bg-gray-50'
      }`}
    >
      <span className={isActive(to) ? colorClass : 'text-gray-400'}>{icon}</span>
      <span>{children}</span>
    </Link>
  );

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-50">
      {/* Mobile Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <Link to="/home" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-900 rounded-sm flex items-center justify-center">
            <Logo className="w-5 h-5" color="#E8EAED" />
          </div>
          <span className="font-bold text-sm">InfraPhysics</span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-gray-100 rounded-sm transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute top-14 left-0 right-0 bg-white border-b border-gray-200 z-50 shadow-lg animate-fade-in">
            <nav className="flex flex-col p-4 gap-1">
              <NavLink to="/home" colorClass="text-gray-900" icon={<HomeIcon />}>Home</NavLink>
              <NavLink to="/projects" colorClass="text-emerald-600" icon={<GearIcon />}>Projects</NavLink>
              <NavLink to="/threads" colorClass="text-amber-600" icon={<ThreadIcon />}>Threads</NavLink>
              <NavLink to="/bits2bricks" colorClass="text-blue-600" icon={<GradCapIcon />}>Bits2Bricks</NavLink>
              <NavLink to="/second-brain" colorClass="text-gray-900" icon={<DiamondIcon />}>Second Brain</NavLink>

              {/* Divider */}
              <div className="my-3 border-t border-gray-100"></div>

              {/* Social Links */}
              <div className="flex items-center gap-3 px-4 py-2">
                <span className="text-xs font-mono text-gray-400 uppercase">Connect:</span>
                <a
                  href="https://github.com/yago"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-sm transition-all"
                >
                  <GitHubIcon />
                </a>
                <a
                  href="https://linkedin.com/in/yago"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-sm transition-all"
                >
                  <LinkedInIcon />
                </a>
                <a
                  href="https://x.com/yago"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-sm transition-all"
                >
                  <TwitterIcon />
                </a>
              </div>

              {/* Random Button */}
              <button
                onClick={handleRandom}
                className="flex items-center gap-2 px-4 py-2 text-xs font-mono text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="w-4 h-4 flex items-center justify-center bg-gray-100 rounded-sm text-[10px]">?</span>
                Random post
              </button>
            </nav>
          </div>
        </>
      )}
    </div>
  );
};

// 2. Footer - Professional Industrial Style
const Footer: React.FC = () => {
  return (
    <footer className="w-full py-12 mt-16 border-t border-gray-200 relative z-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Logo className="w-6 h-6 text-gray-900" />
              <span className="font-bold text-sm">InfraPhysics</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mb-4 max-w-sm">
              A digital laboratory exploring software systems, hardware design, and the philosophy of building things that matter.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/yago"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-sm transition-all"
                aria-label="GitHub"
              >
                <GitHubIcon />
              </a>
              <a
                href="https://linkedin.com/in/yago"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-sm transition-all"
                aria-label="LinkedIn"
              >
                <ExternalLinkIcon />
              </a>
              <a
                href="https://x.com/yago"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-sm transition-all"
                aria-label="Twitter/X"
              >
                <ExternalLinkIcon />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-4">Explore</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/projects" className="text-xs text-gray-600 hover:text-emerald-600 transition-colors">Projects</Link>
              <Link to="/threads" className="text-xs text-gray-600 hover:text-amber-600 transition-colors">Threads</Link>
              <Link to="/bits2bricks" className="text-xs text-gray-600 hover:text-blue-600 transition-colors">Bits2Bricks</Link>
              <Link to="/second-brain" className="text-xs text-gray-600 hover:text-gray-900 transition-colors">Second Brain</Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-4">Contact</h4>
            <nav className="flex flex-col gap-2">
              <a href="mailto:yago@infraphysics.net" className="text-xs text-gray-600 hover:text-gray-900 transition-colors">
                yago@infraphysics.net
              </a>
              <a href="https://github.com/yago" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1">
                GitHub <ExternalLinkIcon />
              </a>
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-[10px] font-mono text-gray-400">
            © {new Date().getFullYear()} InfraPhysics. Built with React, TypeScript & Vite.
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

// 3. Search Bar
interface SearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

const SearchBar: React.FC<SearchProps> = ({ onSearch, placeholder = "search...", autoFocus = true }) => {
  return (
    <div className="mb-8">
      <div className="group flex items-center border border-gray-200 px-3 py-2.5 focus-within:border-gray-400 transition-colors">
        <SearchIcon />
        <input
          type="text"
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent border-none ml-2.5 font-mono text-sm focus:outline-none placeholder-gray-400 text-black"
          autoFocus={autoFocus}
        />
      </div>
    </div>
  );
};

// 4. Section View (Visual: Projects, Threads, Bits2Bricks)
interface SectionProps {
  category: Category;
  colorClass: string;
}

// Category descriptions for professional context
const categoryDescriptions: Record<string, { title: string; description: string; icon: React.ReactNode }> = {
  projects: {
    title: 'Projects',
    description: 'Technical explorations, implementations, and case studies. Each project includes architecture decisions, challenges faced, and lessons learned.',
    icon: <GearIcon />
  },
  threads: {
    title: 'Threads',
    description: 'Long-form essays and connected thoughts on software engineering, systems design, and the philosophy of building things.',
    icon: <ThreadIcon />
  },
  bits2bricks: {
    title: 'Bits to Bricks',
    description: 'Hardware projects bridging digital logic and physical reality. From FPGAs to 3D printing, exploring where code meets atoms.',
    icon: <GradCapIcon />
  }
};

const SectionView: React.FC<SectionProps> = ({ category, colorClass }) => {
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [showFilters, setShowFilters] = useState(false);

  const filteredPosts = useMemo(() => {
    let sectionPosts = posts.filter(p => p.category === category);

    // Apply search filter
    if (query) {
      const lowerQuery = query.toLowerCase();
      sectionPosts = sectionPosts.filter(p =>
        (p.displayTitle || p.title).toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.content.toLowerCase().includes(lowerQuery)
      );
    }

    // Apply sorting
    sectionPosts.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'title') return (a.displayTitle || a.title).localeCompare(b.displayTitle || b.title);
      return 0;
    });

    return sectionPosts;
  }, [category, query, sortBy]);

  const getExcerpt = (content: string, query: string) => {
    if (!query) return null;
    const index = content.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return null;
    const start = Math.max(0, index - 50);
    const end = Math.min(content.length, index + 100);
    return "..." + content.substring(start, end) + "...";
  };

  const categoryInfo = categoryDescriptions[category] || { title: category, description: '', icon: null };

  return (
    <div className="animate-fade-in">
      {/* Header Section - Industrial Style */}
      <header className="mb-8 pb-6 border-b border-gray-200">
        <div className="flex items-start gap-4 mb-4">
          <div className={`p-3 rounded-sm bg-gray-100 ${colorClass}`}>
            {categoryInfo.icon}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight lowercase text-black mb-2">
              {categoryInfo.title}
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">
              {categoryInfo.description}
            </p>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-6 mt-4 text-xs font-mono text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            {filteredPosts.length} {filteredPosts.length === 1 ? 'entry' : 'entries'}
          </span>
          <span className="flex items-center gap-1.5">
            <ClockIcon />
            {filteredPosts.reduce((acc, p) => acc + calculateReadingTime(p.content), 0)} min total read
          </span>
        </div>
      </header>

      {/* Toolbar - Search & Filters */}
      <div className="mb-8 space-y-4">
        {/* Search Row */}
        <div className="flex gap-3">
          <div className="flex-1 group flex items-center border border-gray-200 px-3 py-2.5 focus-within:border-blue-400 transition-colors bg-white">
            <SearchIcon />
            <input
              type="text"
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${category}...`}
              className="w-full bg-transparent border-none ml-2.5 font-mono text-sm focus:outline-none placeholder-gray-400 text-black"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 border border-gray-200 flex items-center gap-2 text-xs font-mono transition-all ${showFilters ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 hover:border-gray-400'}`}
          >
            <FilterIcon />
            Filters
          </button>

          {/* View Mode Toggle */}
          <div className="flex border border-gray-200 bg-white">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <ListIcon />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <GridIcon />
            </button>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="flex flex-wrap gap-4 p-4 bg-gray-50 border border-gray-200 rounded-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-500 uppercase">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'title')}
                className="text-xs font-mono border border-gray-300 rounded-sm px-2 py-1.5 bg-white focus:outline-none focus:border-blue-400"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Alphabetical</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Content - List or Grid View */}
      {viewMode === 'list' ? (
        <div className="space-y-8">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post, index) => {
              const contentExcerpt = getExcerpt(post.content, query);

              return (
                <Link
                  key={post.id}
                  to={`/${post.category}/${post.id}`}
                  className="group block transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row md:gap-6 md:items-start p-4 md:p-0 border border-gray-100 md:border-0 rounded-sm bg-white md:bg-transparent hover:bg-gray-50 md:hover:bg-transparent">

                    {/* Index Number - Industrial Style */}
                    <div className="hidden md:flex flex-shrink-0 w-8 h-8 items-center justify-center text-xs font-mono text-gray-300 border border-gray-200 rounded-sm">
                      {String(index + 1).padStart(2, '0')}
                    </div>

                    {/* Thumbnail */}
                    <div className="w-full md:w-48 md:h-32 flex-shrink-0 bg-gray-100 border border-gray-200 overflow-hidden rounded-sm">
                      <img
                        src={post.thumbnail || 'https://via.placeholder.com/150'}
                        alt=""
                        className="w-full h-auto aspect-video md:aspect-auto md:h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-grow py-3 md:py-0">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                        <h2 className="text-lg font-semibold lowercase leading-tight group-hover:text-blue-600 transition-colors">
                          <Highlight text={post.displayTitle || post.title} query={query} />
                        </h2>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-400 font-mono whitespace-nowrap">
                            {formatDate(post.date)}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-3">
                        <Highlight text={post.description} query={query} />
                      </p>

                      {/* Meta Row */}
                      <div className="flex items-center gap-4 text-xs text-gray-400 font-mono">
                        <span className="flex items-center gap-1">
                          <ClockIcon />
                          {calculateReadingTime(post.content)} min
                        </span>
                        <span className="flex items-center gap-1">
                          <ArrowRightIcon />
                          Read case study
                        </span>
                      </div>

                      {/* Search Excerpt */}
                      {contentExcerpt && (
                        <div className="mt-3 text-xs text-gray-500 font-mono bg-yellow-50 p-2 border-l-2 border-yellow-400">
                          <Highlight text={contentExcerpt} query={query} />
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="py-16 text-center">
              <div className="text-gray-300 text-4xl mb-4">∅</div>
              <p className="text-gray-400 font-mono text-sm">No entries found matching "{query}"</p>
            </div>
          )}
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.length > 0 ? (
            filteredPosts.map(post => (
              <Link
                key={post.id}
                to={`/${post.category}/${post.id}`}
                className="group block bg-white border border-gray-200 rounded-sm overflow-hidden hover:border-blue-400 hover:shadow-lg transition-all duration-300"
              >
                <div className="aspect-video bg-gray-100 overflow-hidden">
                  <img
                    src={post.thumbnail || 'https://via.placeholder.com/150'}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-gray-400 uppercase">{formatDate(post.date)}</span>
                    <span className="text-[10px] font-mono text-gray-400">{calculateReadingTime(post.content)} min</span>
                  </div>
                  <h3 className="font-semibold text-sm lowercase mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {post.displayTitle || post.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2">{post.description}</p>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-16 text-center">
              <div className="text-gray-300 text-4xl mb-4">∅</div>
              <p className="text-gray-400 font-mono text-sm">No entries found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// 5. Second Brain View - Knowledge Graph / Zettelkasten Style
const FieldNotesView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState<'timeline' | 'graph'>('timeline');

  // Date Range Slider State
  const allFieldNotes = posts.filter(p => p.category === 'fieldnotes');
  const timestamps = allFieldNotes.map(p => new Date(p.date).getTime()).sort((a,b) => a - b);
  const minTime = timestamps[0] || new Date().getTime();
  const maxTime = timestamps[timestamps.length - 1] || new Date().getTime();
  const [dateRange, setDateRange] = useState<[number, number]>([minTime, maxTime]);

  // Extract keywords/tags from content for interconnections
  const extractKeywords = (content: string): string[] => {
    const commonWords = ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'to', 'of', 'and', 'in', 'for', 'on', 'with', 'as', 'by', 'at', 'from', 'or', 'be', 'this', 'that', 'it', 'not', 'but', 'what', 'all', 'when', 'we', 'can', 'there', 'use', 'each', 'which', 'do', 'how', 'if', 'will', 'way', 'about', 'many', 'then', 'them', 'would', 'like', 'so', 'these', 'her', 'him', 'has', 'more', 'could', 'up', 'out', 'go', 'see', 'no', 'its', 'i'];
    const words = content.toLowerCase()
      .replace(/<[^>]*>/g, ' ')
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !commonWords.includes(w));

    // Count occurrences and return top keywords
    const counts: Record<string, number> = {};
    words.forEach(w => { counts[w] = (counts[w] || 0) + 1; });
    return Object.entries(counts)
      .filter(([_, count]) => count >= 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  };

  // Find related notes based on shared keywords
  const findRelatedNotes = (post: Post): Post[] => {
    if (!post) return [];
    const postKeywords = extractKeywords(post.content);

    return allFieldNotes
      .filter(p => p.id !== post.id)
      .map(p => {
        const otherKeywords = extractKeywords(p.content);
        const shared = postKeywords.filter(k => otherKeywords.includes(k));
        return { post: p, score: shared.length };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(({ post }) => post);
  };

  // Filter posts logic
  const filteredNotes = useMemo(() => {
    return allFieldNotes
      .filter(p => {
        const t = new Date(p.date).getTime();
        return t >= dateRange[0] && t <= dateRange[1];
      })
      .filter(p => (p.displayTitle || p.title).toLowerCase().includes(query.toLowerCase()) || p.content.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [query, dateRange, allFieldNotes]);

  // Auto-select first note if none selected
  useEffect(() => {
    if (!id && filteredNotes.length > 0) {
      navigate(`/second-brain/${filteredNotes[0].id}`, { replace: true });
    }
  }, [id, filteredNotes, navigate]);

  // Active Post
  const activePost = useMemo(() => {
    if (id) return allFieldNotes.find(p => p.id === id);
    return filteredNotes[0] || null;
  }, [id, filteredNotes, allFieldNotes]);

  // Related notes for active post
  const relatedNotes = useMemo(() => {
    return activePost ? findRelatedNotes(activePost) : [];
  }, [activePost]);

  // Keywords for active post
  const activeKeywords = useMemo(() => {
    return activePost ? extractKeywords(activePost.content) : [];
  }, [activePost]);

  // Slider Handlers
  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setDateRange([Math.min(val, dateRange[1]), dateRange[1]]);
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setDateRange([dateRange[0], Math.max(val, dateRange[0])]);
  };

  // Get all unique keywords across all notes
  const allKeywords = useMemo(() => {
    const keywordCounts: Record<string, number> = {};
    allFieldNotes.forEach(note => {
      extractKeywords(note.content).forEach(kw => {
        keywordCounts[kw] = (keywordCounts[kw] || 0) + 1;
      });
    });
    return Object.entries(keywordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);
  }, [allFieldNotes]);

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      {/* Header - Knowledge System */}
      <header className="mb-6 pb-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gray-100 rounded-sm">
                <DiamondIcon />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight lowercase text-black">
                second brain
              </h1>
            </div>
            <p className="text-sm text-gray-500 max-w-xl">
              A personal knowledge base. Notes interconnect through shared concepts, forming a web of ideas and observations.
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex border border-gray-200 bg-white">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 text-xs font-mono transition-colors ${viewMode === 'timeline' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Timeline
            </button>
            <button
              onClick={() => setViewMode('graph')}
              className={`px-3 py-1.5 text-xs font-mono transition-colors ${viewMode === 'graph' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Graph
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 text-xs font-mono text-gray-400 mb-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            {allFieldNotes.length} notes
          </span>
          <span className="flex items-center gap-1.5">
            <LinkIcon />
            {allKeywords.length} concepts
          </span>
          <span className="flex items-center gap-1.5">
            <ClockIcon />
            {filteredNotes.length} in range
          </span>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-end justify-between">
          {/* Search */}
          <div className="w-full md:w-1/3">
            <div className="flex items-center border border-gray-200 px-3 py-2 bg-white focus-within:border-blue-400 transition-colors">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search notes..."
                onChange={(e) => setQuery(e.target.value)}
                className="w-full text-xs font-mono ml-2 focus:outline-none placeholder-gray-400 bg-transparent"
              />
            </div>
          </div>

          {/* Date Range Slider */}
          <div className="w-full md:w-1/3 flex flex-col gap-2">
            <div className="flex justify-between text-[10px] font-mono text-gray-400 uppercase">
              <span>{formatDateCompact(new Date(dateRange[0]).toISOString())}</span>
              <span>{formatDateCompact(new Date(dateRange[1]).toISOString())}</span>
            </div>
            <div className="relative h-4 flex items-center">
              <div className="absolute w-full h-0.5 bg-gray-200 rounded-full"></div>
              <input
                type="range"
                min={minTime} max={maxTime}
                value={dateRange[0]}
                onChange={handleStartChange}
                className="dual-range-input absolute w-full h-full opacity-0 cursor-pointer"
                style={{ zIndex: dateRange[0] > (minTime + maxTime) / 2 ? 20 : 10 }}
              />
              <input
                type="range"
                min={minTime} max={maxTime}
                value={dateRange[1]}
                onChange={handleEndChange}
                className="dual-range-input absolute w-full h-full opacity-0 cursor-pointer"
                style={{ zIndex: dateRange[1] <= (minTime + maxTime) / 2 ? 20 : 10 }}
              />
              <div
                className="absolute w-3 h-3 bg-blue-500 rounded-full pointer-events-none border-2 border-white shadow-sm"
                style={{ left: `${((dateRange[0] - minTime) / (maxTime - minTime || 1)) * 100}%`, transform: 'translateX(-50%)' }}
              ></div>
              <div
                className="absolute w-3 h-3 bg-gray-900 rounded-full pointer-events-none border-2 border-white shadow-sm"
                style={{ left: `${((dateRange[1] - minTime) / (maxTime - minTime || 1)) * 100}%`, transform: 'translateX(-50%)' }}
              ></div>
              <div
                className="absolute h-0.5 bg-blue-500"
                style={{
                  left: `${((dateRange[0] - minTime) / (maxTime - minTime || 1)) * 100}%`,
                  right: `${100 - ((dateRange[1] - minTime) / (maxTime - minTime || 1)) * 100}%`
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Concept Tags - Quick Filters */}
        <div className="flex flex-wrap gap-2 mt-4">
          {allKeywords.slice(0, 10).map(([keyword, count]) => (
            <button
              key={keyword}
              onClick={() => setQuery(keyword)}
              className={`px-2 py-1 text-[10px] font-mono border rounded-sm transition-all ${
                query === keyword
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              {keyword}
              <span className="ml-1 text-[8px] opacity-60">({count})</span>
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 bg-gray-50 border border-gray-200 rounded-sm">
        <div className="h-full grid grid-cols-1 md:grid-cols-12">
          {/* LEFT COLUMN: Note List */}
          <div className="h-full overflow-y-auto p-4 md:col-span-4 lg:col-span-3 md:border-r border-gray-200">
            <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-3 px-2">
              {filteredNotes.length} notes
            </div>
            <ul className="space-y-1">
              {filteredNotes.length > 0 ? filteredNotes.map(p => {
                const isSelected = id === p.id;

                return (
                  <li key={p.id} className="w-full">
                    <Link
                      to={`/second-brain/${p.id}`}
                      className={`
                        block py-2.5 px-3 text-xs font-mono transition-all rounded-sm
                        ${isSelected ? 'bg-gray-900 text-white' : 'hover:bg-gray-100 text-gray-600'}
                      `}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`${isSelected ? 'text-gray-400' : 'text-gray-400'} text-[10px]`}>
                          {formatDateCompact(p.date)}
                        </span>
                        <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-blue-400' : 'bg-gray-300'}`}></span>
                      </div>
                      <span className="block truncate font-medium">
                        {p.displayTitle || p.title}
                      </span>
                    </Link>
                  </li>
                );
              }) : (
                <li className="text-xs font-mono text-gray-300 py-4 italic px-2">No notes match your filters</li>
              )}
            </ul>
          </div>

          {/* CENTER COLUMN: Note Content */}
          <div className="h-full overflow-y-auto p-6 md:col-span-5 lg:col-span-6 bg-white border-r border-gray-200">
            {activePost ? (
              <div>
                {/* Note Header */}
                <header className="mb-6 pb-4 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                      {formatDate(activePost.date)}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">
                      ID: {activePost.id}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold lowercase mb-2">
                    {activePost.displayTitle || activePost.title}
                  </h2>
                  {/* Keywords */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {activeKeywords.map(kw => (
                      <span
                        key={kw}
                        onClick={() => setQuery(kw)}
                        className="px-2 py-0.5 text-[10px] font-mono bg-blue-50 text-blue-600 rounded-sm cursor-pointer hover:bg-blue-100 transition-colors"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                </header>

                {/* Note Content */}
                <div
                  className="text-sm leading-relaxed text-gray-700 font-light content-html"
                  dangerouslySetInnerHTML={{ __html: activePost.content }}
                />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-300">
                <DiamondIcon />
                <p className="text-xs font-mono mt-4">Select a note to view</p>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Connections & Related */}
          <div className="hidden lg:block h-full overflow-y-auto p-4 md:col-span-3 bg-gray-50">
            <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-4">
              Connections
            </div>

            {activePost && relatedNotes.length > 0 ? (
              <div className="space-y-3">
                {relatedNotes.map(related => (
                  <Link
                    key={related.id}
                    to={`/second-brain/${related.id}`}
                    className="block p-3 bg-white border border-gray-200 rounded-sm hover:border-blue-400 transition-all group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <LinkIcon />
                      <span className="text-[10px] font-mono text-gray-400">
                        {formatDateCompact(related.date)}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-gray-700 group-hover:text-blue-600 transition-colors block truncate">
                      {related.displayTitle || related.title}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-400 font-mono italic">
                No direct connections found
              </div>
            )}

            {/* Backlinks Section */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-3">
                Quick Nav
              </div>
              <div className="space-y-2">
                <Link
                  to="/projects"
                  className="flex items-center gap-2 text-xs text-gray-500 hover:text-emerald-600 transition-colors"
                >
                  <ArrowRightIcon />
                  Projects
                </Link>
                <Link
                  to="/threads"
                  className="flex items-center gap-2 text-xs text-gray-500 hover:text-amber-600 transition-colors"
                >
                  <ArrowRightIcon />
                  Threads
                </Link>
                <Link
                  to="/bits2bricks"
                  className="flex items-center gap-2 text-xs text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <ArrowRightIcon />
                  Bits2Bricks
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 6. Single Post View (Standard) - Case Study Format
const PostView: React.FC = () => {
  const { category, id } = useParams();
  const navigate = useNavigate();
  const post = posts.find(p => p.id === id && p.category === category);

  // Get random recommended posts
  const recommendedPosts = useMemo(() => {
    if (!post) return [];
    const others = posts.filter(p => p.id !== post.id && p.category !== 'fieldnotes');
    const shuffled = others.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, [post]);

  if (!post) return (
    <div className="py-20 text-center">
      <div className="text-6xl mb-4 text-gray-200">404</div>
      <p className="font-mono text-gray-400">Entry not found in the archive</p>
      <Link to="/home" className="inline-block mt-6 px-4 py-2 bg-gray-900 text-white text-sm font-mono hover:bg-gray-800 transition-colors">
        Return Home
      </Link>
    </div>
  );

  let accentClass = "text-gray-500";
  let accentBg = "bg-gray-100";
  let accentBorder = "border-gray-300";
  if (post.category === 'projects') { accentClass = "text-emerald-600"; accentBg = "bg-emerald-50"; accentBorder = "border-emerald-200"; }
  if (post.category === 'threads') { accentClass = "text-amber-600"; accentBg = "bg-amber-50"; accentBorder = "border-amber-200"; }
  if (post.category === 'bits2bricks') { accentClass = "text-blue-600"; accentBg = "bg-blue-50"; accentBorder = "border-blue-200"; }

  // Mock project metadata - in real app would come from post frontmatter
  const projectMeta = {
    status: 'completed' as const,
    github: `https://github.com/yago/${post.id}`,
    technologies: ['React', 'TypeScript', 'Vite'],
    duration: '3 months'
  };

  return (
    <article className="animate-fade-in max-w-3xl">
      {/* Breadcrumb */}
      <nav className="mb-6 text-xs font-mono text-gray-400 flex items-center gap-2">
        <Link to="/home" className="hover:text-gray-600 transition-colors">home</Link>
        <span>/</span>
        <Link to={`/${post.category}`} className={`hover:text-gray-600 transition-colors`}>{post.category}</Link>
        <span>/</span>
        <span className="text-gray-600">{post.id}</span>
      </nav>

      {/* Hero Header */}
      <header className="mb-10">
        {/* Category & Meta Line */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Link
            to={`/${post.category}`}
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-mono uppercase tracking-wider ${accentBg} ${accentClass} ${accentBorder} border rounded-sm hover:opacity-80 transition-opacity`}
          >
            {post.category}
          </Link>
          <StatusBadge status={projectMeta.status} />
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold lowercase tracking-tight mb-4">
          {post.displayTitle || post.title}
        </h1>

        {/* Description */}
        <p className="text-lg text-gray-500 leading-relaxed mb-6">
          {post.description}
        </p>

        {/* Meta Grid - Industrial Info Panel */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 border border-gray-200 rounded-sm">
          <div>
            <span className="text-[10px] font-mono text-gray-400 uppercase block mb-1">Published</span>
            <span className="text-sm font-medium">{formatDate(post.date)}</span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-gray-400 uppercase block mb-1">Read Time</span>
            <span className="text-sm font-medium">{calculateReadingTime(post.content)} min</span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-gray-400 uppercase block mb-1">Updated</span>
            <span className="text-sm font-medium">{formatRelativeTime(post.date)}</span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-gray-400 uppercase block mb-1">Source</span>
            <a
              href={projectMeta.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              <GitHubIcon />
              GitHub
              <ExternalLinkIcon />
            </a>
          </div>
        </div>

        {/* Technologies Tags */}
        {post.category === 'projects' && (
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-[10px] font-mono text-gray-400 uppercase">Stack:</span>
            {projectMeta.technologies.map(tech => (
              <span
                key={tech}
                className="px-2 py-0.5 text-[10px] font-mono bg-gray-900 text-white rounded-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Featured Image */}
      {post.thumbnail && (
        <div className="mb-10 aspect-video bg-gray-100 border border-gray-200 rounded-sm overflow-hidden">
          <img
            src={post.thumbnail}
            alt={post.displayTitle || post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Article Content */}
      <div
        className="max-w-none text-base leading-loose text-gray-800 font-light content-html"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Share & Actions Bar */}
      <div className="mt-12 pt-6 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-gray-400">Share:</span>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.displayTitle || post.title)}&url=${encodeURIComponent(window.location.href)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-blue-500 transition-colors text-sm"
          >
            Twitter
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-blue-700 transition-colors text-sm"
          >
            LinkedIn
          </a>
        </div>
        <a
          href={projectMeta.github}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-xs font-mono hover:bg-gray-800 transition-colors rounded-sm"
        >
          <GitHubIcon />
          View on GitHub
        </a>
      </div>

      {/* Related Posts - Case Studies */}
      <div className="mt-16 pt-8 border-t border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-mono text-gray-400 uppercase tracking-wider">Related Case Studies</h3>
          <Link to={`/${post.category}`} className="text-xs font-mono text-blue-600 hover:underline flex items-center gap-1">
            View all <ArrowRightIcon />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendedPosts.map(rec => {
            let recAccent = "text-gray-500";
            if (rec.category === 'projects') recAccent = "text-emerald-600";
            if (rec.category === 'threads') recAccent = "text-amber-600";
            if (rec.category === 'bits2bricks') recAccent = "text-blue-600";

            return (
              <Link key={rec.id} to={`/${rec.category}/${rec.id}`} className="group block bg-white border border-gray-200 rounded-sm overflow-hidden hover:border-gray-400 hover:shadow-sm transition-all">
                <div className="aspect-video bg-gray-100 overflow-hidden">
                  <img src={rec.thumbnail || 'https://via.placeholder.com/150'} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                </div>
                <div className="p-4">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className={`text-[10px] uppercase font-mono ${recAccent}`}>{rec.category}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{formatDate(rec.date)}</span>
                  </div>
                  <h4 className="text-sm font-semibold leading-tight group-hover:text-blue-600 transition-colors lowercase">{rec.displayTitle || rec.title}</h4>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </article>
  );
};

// 7. Home View - Professional Landing
const HomeView: React.FC = () => {
  const navigate = useNavigate();

  // Get all non-fieldnotes posts sorted by date
  const sortedPosts = useMemo(() => {
    return posts
      .filter(p => p.category !== 'fieldnotes')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, []);

  const latestPost = sortedPosts[0];
  const recentPosts = sortedPosts.slice(1, 5);

  // Category stats
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    posts.filter(p => p.category !== 'fieldnotes').forEach(p => {
      stats[p.category] = (stats[p.category] || 0) + 1;
    });
    return stats;
  }, []);

  const getCategoryColor = (cat: Category) => {
    if(cat === 'projects') return 'text-emerald-600';
    if(cat === 'threads') return 'text-amber-600';
    if(cat === 'bits2bricks') return 'text-blue-600';
    return 'text-gray-600';
  };

  const getCategoryBg = (cat: Category) => {
    if(cat === 'projects') return 'bg-emerald-50 border-emerald-200';
    if(cat === 'threads') return 'bg-amber-50 border-amber-200';
    if(cat === 'bits2bricks') return 'bg-blue-50 border-blue-200';
    return 'bg-gray-50 border-gray-200';
  };

  return (
    <div className="flex flex-col gap-12 animate-fade-in">
      {/* Hero Section - Professional Intro */}
      <section className="pb-8 border-b border-gray-200">
        {/* Name & Role */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 bg-gray-900 rounded-sm flex items-center justify-center flex-shrink-0">
            <Logo className="w-10 h-10" color="#E8EAED" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">
              Yago
            </h1>
            <p className="text-sm text-gray-500 font-mono">
              Software Engineer & Systems Thinker
            </p>
          </div>
        </div>

        {/* Bio */}
        <div className="max-w-2xl mb-6">
          <p className="text-gray-600 leading-relaxed mb-4">
            Building at the intersection of <span className="text-blue-600 font-medium">software entropy</span>, <span className="text-emerald-600 font-medium">hardware permanence</span>, and <span className="text-amber-600 font-medium">minimal logic</span>. I believe in systems that are simple enough to understand, robust enough to last, and elegant enough to inspire.
          </p>
          <p className="text-gray-500 text-sm leading-relaxed">
            Currently exploring distributed systems, FPGA design, and the philosophy of building things that matter. This site is my public notebook — a collection of projects, essays, and observations from the frontier.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex flex-wrap gap-6 mb-6 py-4 px-5 bg-gray-50 border border-gray-200 rounded-sm">
          <div>
            <span className="text-2xl font-bold text-gray-900">{sortedPosts.length}</span>
            <span className="text-xs font-mono text-gray-500 ml-2 uppercase">Publications</span>
          </div>
          <div className="border-l border-gray-300 pl-6">
            <span className="text-2xl font-bold text-gray-900">{posts.filter(p => p.category === 'fieldnotes').length}</span>
            <span className="text-xs font-mono text-gray-500 ml-2 uppercase">Notes</span>
          </div>
          <div className="border-l border-gray-300 pl-6">
            <span className="text-2xl font-bold text-gray-900">{Object.keys(categoryStats).length}</span>
            <span className="text-xs font-mono text-gray-500 ml-2 uppercase">Topics</span>
          </div>
        </div>

        {/* Social Links - Industrial Style */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-mono text-gray-400 uppercase">Connect:</span>
          <a
            href="https://github.com/yago"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono bg-gray-900 text-white rounded-sm hover:bg-gray-800 transition-colors"
          >
            <GitHubIcon />
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/yago"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono border border-gray-300 text-gray-600 rounded-sm hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            LinkedIn
          </a>
          <a
            href="https://x.com/yago"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono border border-gray-300 text-gray-600 rounded-sm hover:border-gray-900 hover:text-gray-900 transition-colors"
          >
            X / Twitter
          </a>
          <a
            href="mailto:yago@infraphysics.net"
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono border border-gray-300 text-gray-600 rounded-sm hover:border-gray-900 hover:text-gray-900 transition-colors"
          >
            Email
          </a>
        </div>
      </section>

      {/* Featured / Latest Post */}
      {latestPost && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-mono text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              Latest
            </h2>
            <span className="text-[10px] font-mono text-gray-400">{formatRelativeTime(latestPost.date)}</span>
          </div>

          <div
            onClick={() => navigate(`/${latestPost.category}/${latestPost.id}`)}
            className="cursor-pointer group bg-white border border-gray-200 rounded-sm overflow-hidden hover:border-blue-400 hover:shadow-lg transition-all"
          >
            <div className="md:flex">
              {/* Thumbnail */}
              <div className="md:w-1/3 aspect-video md:aspect-auto bg-gray-100">
                <img
                  src={latestPost.thumbnail || 'https://via.placeholder.com/400'}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex-1 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-2 py-0.5 text-[10px] font-mono uppercase ${getCategoryColor(latestPost.category)} ${getCategoryBg(latestPost.category)} border rounded-sm`}>
                    {latestPost.category}
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">{formatDate(latestPost.date)}</span>
                </div>

                <h3 className="text-xl md:text-2xl font-bold leading-tight mb-3 group-hover:text-blue-600 transition-colors lowercase">
                  {latestPost.displayTitle || latestPost.title}
                </h3>

                <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
                  {latestPost.description}
                </p>

                <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
                  <span className="flex items-center gap-1">
                    <ClockIcon />
                    {calculateReadingTime(latestPost.content)} min read
                  </span>
                  <span className="flex items-center gap-1 text-blue-600 group-hover:underline">
                    Read case study
                    <ArrowRightIcon />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Category Cards */}
      <section>
        <h2 className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-4">Explore</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Projects */}
          <Link
            to="/projects"
            className="group p-5 bg-white border border-gray-200 rounded-sm hover:border-emerald-400 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-emerald-50 rounded-sm text-emerald-600">
                <GearIcon />
              </div>
              <span className="text-lg font-semibold group-hover:text-emerald-600 transition-colors">Projects</span>
            </div>
            <p className="text-sm text-gray-500 mb-3">Technical explorations and implementations with full case studies.</p>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-gray-400">{categoryStats['projects'] || 0} entries</span>
              <span className="text-emerald-600 flex items-center gap-1 group-hover:underline">
                Browse <ArrowRightIcon />
              </span>
            </div>
          </Link>

          {/* Threads */}
          <Link
            to="/threads"
            className="group p-5 bg-white border border-gray-200 rounded-sm hover:border-amber-400 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-amber-50 rounded-sm text-amber-600">
                <ThreadIcon />
              </div>
              <span className="text-lg font-semibold group-hover:text-amber-600 transition-colors">Threads</span>
            </div>
            <p className="text-sm text-gray-500 mb-3">Long-form essays on engineering, systems design, and philosophy.</p>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-gray-400">{categoryStats['threads'] || 0} entries</span>
              <span className="text-amber-600 flex items-center gap-1 group-hover:underline">
                Browse <ArrowRightIcon />
              </span>
            </div>
          </Link>

          {/* Bits2Bricks */}
          <Link
            to="/bits2bricks"
            className="group p-5 bg-white border border-gray-200 rounded-sm hover:border-blue-400 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-50 rounded-sm text-blue-600">
                <GradCapIcon />
              </div>
              <span className="text-lg font-semibold group-hover:text-blue-600 transition-colors">Bits2Bricks</span>
            </div>
            <p className="text-sm text-gray-500 mb-3">Hardware projects bridging digital logic and physical reality.</p>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-gray-400">{categoryStats['bits2bricks'] || 0} entries</span>
              <span className="text-blue-600 flex items-center gap-1 group-hover:underline">
                Browse <ArrowRightIcon />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Recent Posts */}
      {recentPosts.length > 0 && (
        <section className="border-t border-gray-200 pt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-mono text-gray-400 uppercase tracking-wider">Recent</h2>
            <Link to="/projects" className="text-xs font-mono text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRightIcon />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentPosts.map(post => (
              <Link
                key={post.id}
                to={`/${post.category}/${post.id}`}
                className="group flex gap-4 items-start p-4 bg-white border border-gray-200 rounded-sm hover:border-gray-400 transition-all"
              >
                <div className="w-24 h-16 bg-gray-100 overflow-hidden flex-shrink-0 rounded-sm">
                  <img
                    src={post.thumbnail || 'https://via.placeholder.com/150'}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-mono uppercase ${getCategoryColor(post.category)}`}>
                      {post.category}
                    </span>
                    <span className="text-[10px] text-gray-300 font-mono">{formatDate(post.date)}</span>
                  </div>
                  <h4 className="text-sm font-semibold leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 lowercase">
                    {post.displayTitle || post.title}
                  </h4>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Second Brain Promo */}
      <section className="p-6 bg-gray-900 text-white rounded-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gray-800 rounded-sm">
            <DiamondIcon />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Second Brain</h3>
            <p className="text-sm text-gray-400 mb-4">
              A personal knowledge base with interconnected notes, observations, and working thoughts.
              Explore the raw material behind the polished publications.
            </p>
            <Link
              to="/second-brain"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-900 text-xs font-mono hover:bg-gray-100 transition-colors rounded-sm"
            >
              Explore Notes
              <ArrowRightIcon />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

// Sidebar width constant (w-36 = 9rem = 144px)
const SIDEBAR_WIDTH = 144;

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex selection:bg-yellow-100 selection:text-black relative">

        {/* Dual Grid Background - fixed, covers content area only */}
        <div className="hidden md:block">
          <DualGrid sidebarWidth={SIDEBAR_WIDTH} />
        </div>

        {/* Mobile Navigation */}
        <MobileNav />

        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen">
          <main className="flex-grow w-full max-w-4xl mx-auto px-6 py-10 md:py-16 relative z-10">
            <Routes>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<HomeView />} />

              <Route path="/projects" element={<SectionView category="projects" colorClass="text-emerald-600" />} />
              <Route path="/threads" element={<SectionView category="threads" colorClass="text-amber-600" />} />
              <Route path="/bits2bricks" element={<SectionView category="bits2bricks" colorClass="text-blue-600" />} />

              {/* Second Brain (formerly Field Notes) */}
              <Route path="/second-brain" element={<FieldNotesView />} />
              <Route path="/second-brain/:id" element={<FieldNotesView />} />

              {/* Legacy redirects */}
              <Route path="/fieldnotes" element={<Navigate to="/second-brain" replace />} />
              <Route path="/fieldnotes/:id" element={<Navigate to="/second-brain" replace />} />

              {/* General post view for other categories */}
              <Route path="/:category/:id" element={<PostView />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;