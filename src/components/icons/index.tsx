// SVG icon components

import React from 'react';

export const Logo: React.FC<{ className?: string; color?: string }> = ({ className, color }) => (
  <svg
    viewBox="0 0 992 1072"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill={color || "currentColor"}
  >
    <path d="M415.807 89.113 C 431.038 97.975,449.451 108.662,456.725 112.863 L 469.950 120.500 469.975 425.750 C 469.989 593.638,470.298 731.000,470.662 731.000 C 471.026 731.000,473.164 729.942,475.412 728.648 C 512.430 707.353,539.111 691.750,540.889 690.360 C 541.103 690.192,541.192 571.688,541.087 427.016 C 540.982 282.345,541.166 163.540,541.496 163.006 C 541.843 162.446,543.660 163.018,545.798 164.360 C 547.834 165.639,559.625 172.540,572.000 179.697 C 584.375 186.853,599.000 195.313,604.500 198.498 C 621.902 208.573,638.895 218.392,659.000 229.989 C 698.456 252.748,711.324 260.175,750.000 282.514 C 771.725 295.062,799.400 311.031,811.500 318.001 C 823.600 324.971,842.275 335.781,853.000 342.022 C 863.725 348.263,875.754 355.199,879.731 357.435 L 886.962 361.500 886.731 505.850 L 886.500 650.201 868.000 660.952 C 857.825 666.865,838.700 677.914,825.500 685.506 C 812.300 693.098,797.450 701.680,792.500 704.576 C 787.550 707.473,765.950 719.936,744.500 732.274 C 723.050 744.611,701.000 757.376,695.500 760.641 L 685.500 766.578 685.000 810.449 L 684.500 854.320 661.500 867.806 C 648.850 875.222,620.725 891.733,599.000 904.495 C 546.892 935.107,542.992 937.325,542.372 936.705 C 542.081 936.415,541.608 916.900,541.319 893.339 C 541.031 869.777,540.659 850.355,540.493 850.179 C 540.119 849.781,534.574 852.926,495.500 875.696 C 478.450 885.632,450.484 901.892,433.354 911.830 L 402.208 929.898 372.604 912.791 L 343.000 895.684 343.000 854.842 C 343.000 829.508,343.363 814.000,343.957 814.000 C 344.926 814.000,352.101 817.198,386.659 833.030 C 397.197 837.858,406.759 842.106,407.909 842.471 C 409.972 843.126,410.000 842.915,410.002 826.817 C 410.002 817.843,410.300 795.317,410.663 776.760 L 411.323 743.021 400.412 737.908 C 394.410 735.096,379.600 728.294,367.500 722.792 C 355.400 717.290,344.928 712.324,344.230 711.755 C 342.630 710.453,342.894 670.382,344.500 670.695 C 345.050 670.802,355.400 675.449,367.500 681.021 C 395.300 693.823,415.670 703.000,416.286 703.000 C 416.549 703.000,417.066 681.962,417.435 656.250 C 417.805 630.538,418.309 608.015,418.556 606.200 C 418.968 603.173,418.694 602.770,415.252 601.334 C 405.840 597.407,345.364 569.668,344.250 568.767 C 343.328 568.020,343.000 562.660,343.000 548.310 C 343.000 529.003,343.015 528.870,345.103 529.533 C 346.260 529.900,363.878 537.812,384.254 547.116 C 404.630 556.420,421.429 563.905,421.584 563.749 C 421.808 563.525,423.500 477.811,423.500 466.666 C 423.500 463.938,422.636 463.440,400.500 453.399 C 387.850 447.662,373.675 441.201,369.000 439.041 C 364.325 436.882,356.550 433.313,351.722 431.109 L 342.945 427.104 343.001 340.802 C 343.032 293.336,343.045 254.180,343.029 253.789 C 343.002 253.125,325.140 263.241,282.750 287.927 L 265.000 298.264 265.000 344.632 C 265.000 371.470,264.621 391.000,264.099 391.000 C 263.604 391.000,259.216 389.141,254.349 386.869 C 249.482 384.597,221.425 371.749,192.000 358.319 C 162.575 344.889,137.488 333.237,136.250 332.427 L 134.000 330.954 134.000 275.599 C 134.000 232.526,134.277 220.019,135.250 219.226 C 135.938 218.666,152.025 209.222,171.000 198.239 C 189.975 187.256,209.775 175.783,215.000 172.743 C 220.225 169.704,237.550 159.662,253.500 150.428 C 280.963 134.530,294.231 126.868,340.000 100.477 C 350.725 94.293,365.800 85.592,373.500 81.141 C 381.200 76.690,387.638 73.038,387.807 73.024 C 387.975 73.011,400.575 80.251,415.807 89.113 M685.000 502.500 C 685.000 584.656,685.258 605.991,686.250 605.957 C 686.938 605.934,701.450 597.900,718.500 588.105 L 749.500 570.295 749.757 502.737 L 750.014 435.180 733.757 425.753 C 701.753 407.194,687.151 399.000,686.084 399.000 C 685.312 399.000,685.000 428.815,685.000 502.500 M162.650 446.362 C 195.576 461.522,254.964 488.604,260.750 491.098 L 265.000 492.929 265.000 512.464 C 265.000 525.616,264.652 532.000,263.935 532.000 C 261.898 532.000,136.492 474.744,135.318 473.278 C 134.466 472.215,134.262 466.724,134.589 453.651 C 134.839 443.668,135.034 435.163,135.022 434.750 C 135.010 434.337,135.180 434.000,135.400 434.000 C 135.620 434.000,147.882 439.563,162.650 446.362 M338.633 462.630 C 346.317 466.276,349.394 478.266,344.734 486.396 C 337.659 498.737,318.656 494.978,316.352 480.782 C 314.142 467.165,326.674 456.955,338.633 462.630 M387.996 484.118 C 395.320 488.234,398.262 498.992,394.248 506.980 C 388.812 517.801,373.011 517.751,367.196 506.895 C 359.471 492.475,374.189 476.358,387.996 484.118 M184.709 598.103 C 211.544 610.260,240.475 623.447,249.000 627.406 L 264.500 634.606 264.770 655.303 C 264.919 666.686,264.831 676.000,264.575 676.000 C 264.318 676.000,255.872 672.220,245.804 667.601 C 196.486 644.971,166.178 631.158,153.000 625.303 C 131.653 615.818,133.909 619.106,134.411 598.222 C 134.963 575.219,134.926 576.000,135.459 576.000 C 135.711 576.000,157.873 585.947,184.709 598.103 M334.913 602.769 C 341.868 607.918,344.129 617.526,340.148 625.016 C 334.562 635.528,319.495 635.819,313.466 625.532 C 308.052 616.294,312.755 603.360,322.500 600.684 C 325.973 599.731,332.229 600.781,334.913 602.769 M383.913 623.769 C 390.996 629.013,393.349 639.635,389.005 646.759 C 381.226 659.519,361.629 654.444,360.295 639.324 C 359.128 626.096,373.909 616.361,383.913 623.769 M191.500 744.506 C 219.000 757.025,246.450 769.499,252.500 772.226 C 258.550 774.953,263.843 777.509,264.263 777.905 C 264.682 778.301,264.907 794.649,264.763 814.234 L 264.500 849.842 250.000 841.606 C 242.025 837.076,218.400 823.538,197.500 811.521 C 176.600 799.504,154.325 786.762,148.000 783.206 C 141.675 779.649,135.984 776.101,135.354 775.321 C 134.142 773.821,133.350 721.862,134.510 719.985 C 135.246 718.793,131.023 716.976,191.500 744.506 M327.497 741.903 C 332.480 744.739,335.000 749.473,335.000 756.000 C 335.000 765.453,328.753 772.109,319.752 772.245 C 302.097 772.512,297.782 746.420,314.500 740.485 C 318.951 738.904,323.003 739.347,327.497 741.903 M376.802 763.702 C 381.982 767.569,383.500 770.696,383.500 777.500 C 383.500 782.357,383.014 784.504,381.438 786.615 C 376.205 793.624,368.405 795.778,361.329 792.168 C 349.317 786.040,349.995 768.000,362.450 762.352 C 366.388 760.567,373.499 761.236,376.802 763.702 " fillRule="evenodd"/>
  </svg>
);

export const SearchIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

export const GitHubIcon: React.FC<{ className?: string; size?: number }> = ({ className, size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

export const ExternalLinkIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15 3 21 3 21 9"></polyline>
    <line x1="10" y1="14" x2="21" y2="3"></line>
  </svg>
);

export const FilterIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
  </svg>
);

export const ClockIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

export const LinkIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
  </svg>
);

export const CheckCircleIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

export const CircleIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="6"></circle>
  </svg>
);

export const ArrowRightIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

export const ChevronIcon: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
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

export const HomeIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

export const GearIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

export const ThreadIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

export const GradCapIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
    <path d="M6 12v5c0 1.5 2.5 3 6 3s6-1.5 6-3v-5"></path>
  </svg>
);

export const DiamondIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
    <rect x="12" y="1" width="15.56" height="15.56" rx="2" transform="rotate(45 12 1)"></rect>
  </svg>
);

export const LinkedInIcon: React.FC<{ className?: string; size?: number }> = ({ className, size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

export const TwitterIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

export const RedditIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.102 7.815l.751-3.536 2.176.46a1.5 1.5 0 1 1 1.342.768l-2.062-.436-.485 2.29a8.835 8.835 0 0 1 4.252 2.007 2.5 2.5 0 0 1 3.744 3.343A5.04 5.04 0 0 1 21 14.5C21 18.09 16.97 21 12 21s-9-2.91-9-6.5a5.04 5.04 0 0 1 .18-1.289 2.5 2.5 0 0 1 3.744-3.343 8.836 8.836 0 0 1 4.178-2.053zM9.5 15a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm5 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm-7.105 1.96a.5.5 0 0 1 .67-.232c.263.132.596.236.99.3.396.063.788.095 1.177.096h.036c.39-.002.783-.034 1.18-.098.394-.064.727-.168.99-.3a.5.5 0 0 1 .437.9c-.371.185-.81.31-1.28.385A9.58 9.58 0 0 1 12 18a9.58 9.58 0 0 1-1.595-.09 4.082 4.082 0 0 1-1.28-.385.5.5 0 0 1-.23-.668z"/>
  </svg>
);

export const HackerNewsIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M0 0v24h24V0H0zm12.8 13.4v5.2H11v-5.1L6.7 4.6h2.3l3 6 3-6.1h2.3l-4.5 8.9z"/>
  </svg>
);

export const ClipboardIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

export const CheckIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

export const MenuIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

export const CloseIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export const UserIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

export const MailIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
    <path d="M22 7l-10 7L2 7"></path>
  </svg>
);

export const SunIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

export const MoonIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

export const FolderIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
  </svg>
);

export const BarChartIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"></line>
    <line x1="12" y1="20" x2="12" y2="4"></line>
    <line x1="6" y1="20" x2="6" y2="14"></line>
  </svg>
);

export const SlidersIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14"></line>
    <line x1="4" y1="10" x2="4" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12" y2="3"></line>
    <line x1="20" y1="21" x2="20" y2="16"></line>
    <line x1="20" y1="12" x2="20" y2="3"></line>
    <line x1="1" y1="14" x2="7" y2="14"></line>
    <line x1="9" y1="8" x2="15" y2="8"></line>
    <line x1="17" y1="16" x2="23" y2="16"></line>
  </svg>
);

export const FileTextIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <line x1="10" y1="9" x2="8" y2="9"></line>
  </svg>
);

export const PlayCircleIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polygon points="10 8 16 12 10 16 10 8"></polygon>
  </svg>
);


