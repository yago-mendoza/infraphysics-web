import React, { useState, useMemo, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { posts } from '../data/data';
import { Post, Category } from '../types';

// --- ICONS ---
const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    viewBox="0 0 992 1072" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className} 
    fill="currentColor"
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

// --- UTILS ---
const calculateReadingTime = (content: string) => {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

const parseContent = (content: string) => {
  const lines = content.split('\n');
  return lines.map((line, index) => {
    // H1
    const h1Match = line.match(/^#\s+(.*)/);
    if (h1Match) return <h1 key={index} className="text-xl md:text-2xl font-bold mt-8 mb-4 first:mt-0 tracking-tight">{h1Match[1]}</h1>;

    // H2
    const h2Match = line.match(/^##\s+(.*)/);
    if (h2Match) return <h2 key={index} className="text-lg font-semibold mt-6 mb-3">{h2Match[1]}</h2>;
    
    // Image: ![alt](url)
    const imgMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
    if (imgMatch) {
      const alt = imgMatch[1];
      const src = imgMatch[2];
      return (
        <figure key={index} className="my-6">
           <img src={src} alt={alt} className="w-full max-h-[450px] object-contain bg-gray-50 border border-gray-100 rounded-sm" />
           {alt && <figcaption className="text-xs text-gray-500 mt-2 text-center font-mono">fig: {alt}</figcaption>}
        </figure>
      );
    }
    
    // Empty line
    if (!line.trim()) return <div key={index} className="h-3"></div>;

    // Lists
    if (line.trim().startsWith('- ')) {
       return <li key={index} className="ml-4 list-disc text-sm md:text-base text-gray-800 leading-relaxed pl-1">{line.substring(2)}</li>
    }

    // Paragraph
    return <p key={index} className="mb-2 text-justify leading-relaxed text-sm md:text-base text-gray-700">{line}</p>;
  });
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

// 1. Navigation
const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleRandom = () => {
    const validPosts = posts.filter(p => p.category !== 'fieldnotes');
    if (validPosts.length === 0) return;
    const randomIndex = Math.floor(Math.random() * validPosts.length);
    const randomPost = validPosts[randomIndex];
    navigate(`/${randomPost.category}/${randomPost.id}`);
  };

  // Logic: Sticky ONLY on home ('/').
  const isHome = location.pathname === '/';
  
  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const NavLink = ({ to, colorClass, children, className }: { to: string, colorClass: string, children: React.ReactNode, className?: string }) => (
    <Link 
      to={to} 
      className={`transition-colors duration-200 ${isActive(to) ? colorClass : 'text-gray-500 hover:text-black'} ${className || ''}`}
    >
      {children}
    </Link>
  );

  return (
    <nav className={`w-full py-6 mb-10 border-b border-gray-100 bg-white/80 backdrop-blur-sm ${isHome ? 'sticky top-0 z-50' : ''}`}>
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
           <div className="w-12 h-12 flex-shrink-0 text-black">
             <Logo />
           </div>
           <div className="flex flex-col">
             <Link to="/" className="text-xl font-bold tracking-tight leading-none hover:opacity-70 transition-opacity">
               infraphysics
             </Link>
             <span className="text-[10px] text-gray-500 font-mono tracking-wide mt-1">
               A lossy compression of artifacts
             </span>
           </div>
        </div>
        
        {/* Links Container */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium">
          <div className="flex gap-6 items-center">
            <NavLink to="/projects" colorClass="text-emerald-600">/projects</NavLink>
            <NavLink to="/threads" colorClass="text-amber-600">/threads</NavLink>
            <NavLink to="/bits2bricks" colorClass="text-blue-600">/bits2bricks</NavLink>
            <button onClick={handleRandom} className="text-gray-300 hover:text-black transition-colors">
               /random
            </button>
            <NavLink to="/fieldnotes" colorClass="text-black">/fieldnotes</NavLink>
          </div>
          
          {/* Divider */}
          <div className="hidden md:block w-px h-4 bg-gray-200 mx-2"></div>
          
          <div className="flex gap-6 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 md:border-0">
             <NavLink to="/about" colorClass="text-black">/about</NavLink>
             <NavLink to="/authors" colorClass="text-black">/authors</NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

// 2. Footer
const Footer: React.FC = () => {
  return (
    <footer className="w-full py-16 mt-20 bg-black text-white">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-8">
          <Logo className="w-12 h-12 text-white" />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center text-xs text-gray-400 gap-6 font-mono">
          <div>
            © {new Date().getFullYear()} infraphysics. built for the bricks.
          </div>
          <div className="flex flex-col md:items-end gap-3">
            <a href="mailto:contact@infraphysics.net" className="hover:text-white transition-colors font-bold text-gray-500">contact@infraphysics.net</a>
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
    <div className="mb-12">
      <div className="group flex items-center bg-gray-50 border-2 border-gray-200 px-4 py-3 focus-within:border-black focus-within:bg-white transition-all duration-300 rounded-sm">
        <SearchIcon />
        <input
          type="text"
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent border-none ml-3 font-mono text-sm focus:outline-none placeholder-gray-400 text-black"
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

const SectionView: React.FC<SectionProps> = ({ category, colorClass }) => {
  const [query, setQuery] = useState('');

  const filteredPosts = useMemo(() => {
    const sectionPosts = posts.filter(p => p.category === category);
    if (!query) return sectionPosts;
    const lowerQuery = query.toLowerCase();
    return sectionPosts
      .filter(p => 
        (p.displayTitle || p.title).toLowerCase().includes(lowerQuery) || 
        p.description.toLowerCase().includes(lowerQuery) ||
        p.content.toLowerCase().includes(lowerQuery)
      );
  }, [category, query]);

  const getExcerpt = (content: string, query: string) => {
    if (!query) return null;
    const index = content.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return null;
    const start = Math.max(0, index - 50);
    const end = Math.min(content.length, index + 100);
    return "..." + content.substring(start, end) + "...";
  };

  return (
    <div className="animate-fade-in">
      <header className="mb-10 border-b-4 border-black pb-4">
        {/* Updated Typography: Bold and tight tracking, lowercase */}
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter lowercase text-black">
          {category}
        </h1>
      </header>

      <SearchBar onSearch={setQuery} placeholder={`search ${category} database...`} />

      <div className="space-y-12 md:space-y-12">
        {filteredPosts.length > 0 ? (
          filteredPosts.map(post => {
            const contentExcerpt = getExcerpt(post.content, query);
            
            return (
              <Link 
                key={post.id} 
                to={`/${post.category}/${post.id}`}
                className="group block transition-all duration-300"
              >
                {/* Layout: Column on mobile (Card style), Row on Desktop */}
                <div className="flex flex-col md:flex-row md:gap-8 md:items-start">
                  
                  {/* Thumbnail Container */}
                  <div className="w-full md:w-56 md:h-36 flex-shrink-0 bg-gray-50 border border-gray-100 md:border-gray-200 border-b-0 md:border-b overflow-hidden rounded-t-sm md:rounded-sm">
                    <img 
                      src={post.thumbnail || 'https://via.placeholder.com/150'} 
                      alt="" 
                      className="w-full h-auto aspect-video md:aspect-auto md:h-full object-cover" 
                    />
                  </div>

                  {/* Content Container */}
                  <div className="flex-grow w-full border border-gray-100 border-t-0 p-5 md:border-0 md:p-0 rounded-b-sm bg-white md:bg-transparent">
                    <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-2">
                      <h2 className="text-lg md:text-xl lowercase leading-tight">
                        {/* Mobile Caret */}
                        <span className={`md:hidden mr-2 ${colorClass} no-underline inline-block`}>&gt;</span>
                        
                        {/* Title */}
                        <span className="font-medium decoration-gray-200 underline underline-offset-4 md:font-bold md:decoration-current md:no-underline md:group-hover:underline">
                          <Highlight text={post.displayTitle || post.title} query={query} />
                        </span>
                      </h2>
                      <span className="text-xs text-gray-400 font-mono mt-2 md:mt-0 whitespace-nowrap md:ml-4">{post.date}</span>
                    </div>
                    
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                      <Highlight text={post.description} query={query} />
                    </p>

                    {/* Show excerpt if match is deep in content */}
                    {contentExcerpt && (
                      <p className="mt-3 text-xs text-gray-400 font-mono bg-gray-50 p-2 border-l-2 border-yellow-200">
                         <Highlight text={contentExcerpt} query={query} />
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="py-12 text-center text-gray-300 italic font-mono">
            no_signals_found.
          </div>
        )}
      </div>
    </div>
  );
};

// 5. Field Notes View (formerly Wetware)
const FieldNotesView: React.FC = () => {
  const { id } = useParams();
  const [query, setQuery] = useState('');
  
  // Date Range Slider State
  const allFieldNotes = posts.filter(p => p.category === 'fieldnotes');
  const timestamps = allFieldNotes.map(p => new Date(p.date).getTime()).sort((a,b) => a - b);
  const minTime = timestamps[0] || new Date().getTime();
  const maxTime = timestamps[timestamps.length - 1] || new Date().getTime();
  const [dateRange, setDateRange] = useState<[number, number]>([minTime, maxTime]);

  // Filter posts logic
  const filteredNotes = useMemo(() => {
    return allFieldNotes
      .filter(p => {
        const t = new Date(p.date).getTime();
        return t >= dateRange[0] && t <= dateRange[1];
      })
      .filter(p => (p.displayTitle || p.title).toLowerCase().includes(query.toLowerCase()) || p.content.toLowerCase().includes(query.toLowerCase()));
  }, [query, dateRange, allFieldNotes]);

  // Active Post
  const activePost = useMemo(() => {
    if (id) return filteredNotes.find(p => p.id === id);
    return null; 
  }, [id, filteredNotes]);

  const formatDateYYMMDD = (dateStr: string) => {
    return dateStr.replace(/-/g, '').substring(2);
  };

  // Slider Handlers
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    // Only update the max value, min is fixed
    setDateRange([minTime, val]);
  };

  // Conditional Layout: Split vs Full
  const isSplitView = !!id;

  return (
    <div className="animate-fade-in">
       {/* Header & Filter - Always Visible */}
       <header className="mb-8 pb-4 border-b-4 border-black">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter lowercase text-black mb-6">
          field notes
        </h1>
        
        {/* Filters Container */}
        <div className="flex flex-col md:flex-row gap-6 items-end justify-between">
          <div className="w-full md:w-1/3">
             <input 
                type="text" 
                placeholder="filter logs ..." 
                onChange={(e) => setQuery(e.target.value)}
                className="w-full text-xs font-mono border border-gray-200 p-2 rounded-sm focus:outline-none focus:border-black placeholder-gray-400 bg-gray-50"
             />
          </div>

          {/* Date Range Slider */}
          <div className="w-full md:w-1/3 flex flex-col gap-2">
            <div className="flex justify-between text-[10px] font-mono text-gray-400 uppercase">
               <span>{new Date(minTime).toLocaleDateString()}</span>
               <span>{new Date(dateRange[1]).toLocaleDateString()}</span>
            </div>
            <div className="relative h-4 flex items-center">
               <div className="absolute w-full h-0.5 bg-gray-200 rounded-full"></div>
               {/* Fixed Left Input (Min) - ReadOnly */}
               <input 
                 type="range" 
                 min={minTime} max={maxTime} 
                 value={dateRange[0]} 
                 readOnly
                 className="absolute w-full h-full opacity-0 pointer-events-none z-10"
               />
               {/* Active Right Input (Max) */}
               <input 
                 type="range" 
                 min={minTime} max={maxTime} 
                 value={dateRange[1]} 
                 onChange={handleSliderChange}
                 className="absolute w-full h-full opacity-0 cursor-pointer z-20"
               />
               
               {/* Visual Thumbs */}
               {/* Left Thumb - Gray to indicate fixed */}
               <div 
                 className="absolute w-3 h-3 bg-gray-300 rounded-full pointer-events-none"
                 style={{ left: '0%', transform: 'translateX(-50%)' }}
               ></div>
               {/* Right Thumb - Black for interaction */}
               <div 
                 className="absolute w-3 h-3 bg-black rounded-full pointer-events-none"
                 style={{ left: `${((dateRange[1] - minTime) / (maxTime - minTime || 1)) * 100}%`, transform: 'translateX(-50%)' }}
               ></div>
               
               {/* Highlight Range */}
               <div 
                  className="absolute h-0.5 bg-black"
                  style={{ 
                    left: '0%',
                    right: `${100 - ((dateRange[1] - minTime) / (maxTime - minTime || 1)) * 100}%`
                  }}
               ></div>
            </div>
          </div>
        </div>
      </header>

      <div className={`grid gap-10 transition-all duration-500 ${isSplitView ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1'}`}>
        {/* LEFT COLUMN: LIST */}
        <div className={`${isSplitView ? 'md:col-span-1 border-r border-gray-100 pr-6' : 'md:col-span-1'} transition-all`}>
          <ul className="space-y-2">
            {filteredNotes.length > 0 ? filteredNotes.map(p => {
              const isSelected = id === p.id;
              // Toggle logic: if already selected, go back to main list (deselect), else go to the note
              const targetPath = isSelected ? '/fieldnotes' : `/fieldnotes/${p.id}`;

              return (
                <li key={p.id} className="w-full">
                  <Link 
                    to={targetPath}
                    className={`
                      group flex justify-between items-center py-2 px-3 text-xs font-mono transition-all rounded-sm border-b border-gray-50
                      ${isSelected ? 'bg-black text-white' : 'hover:bg-gray-50 text-gray-600 hover:pl-4'}
                      ${!isSplitView ? 'hover:bg-gray-50' : ''}
                    `}
                  >
                    <span className={`${isSelected ? 'text-gray-300' : 'text-gray-400'} mr-4 tracking-tighter`}>{formatDateYYMMDD(p.date)}</span>
                    
                    {/* Title fills remaining space in expanded view */}
                    <span className={`flex-grow ${!isSplitView ? 'text-left' : 'truncate'}`}>
                      {p.displayTitle || p.title}
                    </span>
                    
                    {/* Decorative arrow only in expanded list view */}
                    {!isSplitView && (
                      <span className="opacity-0 group-hover:opacity-100 text-gray-300">→</span>
                    )}
                  </Link>
                </li>
              );
            }) : (
               <li className="text-xs font-mono text-gray-300 py-4 italic">no traces found in this timeline.</li>
            )}
          </ul>
        </div>

        {/* RIGHT COLUMN: CONTENT (Only Visible if Selected) */}
        {isSplitView && (
          <div className="md:col-span-2 min-h-[50vh]">
            {activePost ? (
              <div className="animate-fade-in">
                 <header className="mb-8 pb-4 border-b border-gray-100 flex justify-between items-baseline font-mono text-xs text-gray-400">
                    <span>id: {activePost.id}</span>
                    <span>{activePost.date}</span>
                 </header>
                 {/* Reduced font size for content */}
                 <div className="font-sans text-xs md:text-sm leading-loose text-gray-800 font-light">
                    {parseContent(activePost.content)}
                 </div>
              </div>
            ) : (
              // Fallback just in case ID is invalid but URL has ID
              <div className="h-full flex flex-col items-center justify-center text-gray-300 text-xs font-mono">
                 <p>encrypted data.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// 6. Single Post View (Standard)
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

  if (!post) return <div className="py-20 text-center font-mono text-gray-400">404_not_found</div>;

  let accentClass = "text-gray-500";
  if (post.category === 'projects') accentClass = "text-emerald-600";
  if (post.category === 'threads') accentClass = "text-amber-600";
  if (post.category === 'bits2bricks') accentClass = "text-blue-600";

  return (
    <article className="animate-fade-in max-w-4xl mx-auto">
      <header className="mb-12 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6 font-mono">
          <Link to={`/${post.category}`} className={`hover:underline uppercase font-bold ${accentClass}`}>
            {post.category}
          </Link>
          <span>/</span>
          <span>{post.id}</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold lowercase mb-4 tracking-tight">{post.displayTitle || post.title}</h1>
        
        <div className="flex items-center gap-4 text-sm text-gray-400 font-mono">
           <span>{post.date}</span>
           <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
           <Link to="/authors" className="text-black font-semibold hover:underline">by Yago Mendoza</Link>
           <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
           <span>{calculateReadingTime(post.content)} min read</span>
        </div>
      </header>
      
      <div className="max-w-none text-base leading-loose text-gray-800 font-light">
        {parseContent(post.content)}
      </div>

      {/* RECOMMENDED SECTION */}
      <div className="mt-20 pt-10 border-t border-black">
        <h3 className="text-xs font-bold uppercase tracking-widest mb-8 text-black font-mono">recommended_signals</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {recommendedPosts.map(rec => (
              <Link key={rec.id} to={`/${rec.category}/${rec.id}`} className="group block">
                 <div className="aspect-video bg-gray-100 mb-4 overflow-hidden border border-gray-100">
                    <img src={rec.thumbnail || 'https://via.placeholder.com/150'} alt="" className="w-full h-full object-cover" />
                 </div>
                 <div className="flex justify-between items-baseline mb-2">
                    <span className="text-[10px] uppercase font-bold text-gray-400 font-mono">{rec.category}</span>
                    <span className="text-[10px] text-gray-300 font-mono">{rec.date}</span>
                 </div>
                 <h4 className="text-sm font-bold leading-tight group-hover:underline">{rec.displayTitle || rec.title}</h4>
              </Link>
           ))}
        </div>
      </div>
    </article>
  );
};

// 7. Authors View
const AuthorsView: React.FC = () => {
  return (
    <div className="animate-fade-in max-w-2xl mx-auto pt-10">
      <header className="mb-12 border-b-4 border-black pb-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter lowercase text-black">
          Authors
        </h1>
      </header>
      
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <img 
          src="https://media.licdn.com/dms/image/v2/D4D03AQH7g1Va8BZnjg/profile-displayphoto-scale_400_400/B4DZj3J3DeH4Ak-/0/1756493215681?e=1770854400&v=beta&t=-yCWFh2JYJLS4gcxNK0zaaJvy5BFSbSSnDDnQj2AbhQ" 
          alt="Yago Mendoza" 
          className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border border-gray-200"
        />
        
        <div>
          <h2 className="text-2xl font-bold mb-2">Yago Mendoza</h2>
          <p className="text-sm text-gray-500 font-mono mb-4">Lead Engineer & Curator</p>
          <p className="text-gray-700 leading-relaxed mb-6 font-light">
             Obsessed with the space where theoretical physics meets hard infrastructure. 
             Exploring software entropy, hardware permanence, and the aesthetics of minimal logic.
          </p>
          
          <div className="flex gap-4 font-mono text-xs">
             <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="bg-black text-white px-3 py-1 rounded-full hover:opacity-80 transition-opacity">/x</a>
             <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="bg-black text-white px-3 py-1 rounded-full hover:opacity-80 transition-opacity">/linkedin</a>
             <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="bg-black text-white px-3 py-1 rounded-full hover:opacity-80 transition-opacity">/github</a>
          </div>
        </div>
      </div>
    </div>
  );
};

// 8. About View
const AboutView: React.FC = () => {
  return (
    <div className="animate-fade-in max-w-2xl mx-auto pt-10">
       <header className="mb-12 border-b-4 border-black pb-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter lowercase text-black">
          About
        </h1>
      </header>
      
      <div className="prose prose-lg font-light text-gray-800 leading-loose text-justify">
        <p>
          InfraPhysics is a digital garden. A collection of thoughts, experiments, and builds.
        </p>
        <p>
          In a world of algorithmic feeds and high-velocity content, this space is designed for low-frequency, high-fidelity signal. 
          There are no tracking pixels, no newsletters, and no comments section.
        </p>
        <p>
          Here I explore the intersection of <strong>bits</strong> (software, logic, entropy) and <strong>bricks</strong> (hardware, physics, permanence).
          Everything here is raw input. No algorithms. Just bits.
        </p>
      </div>
    </div>
  );
};

// 9. Home View
const HomeView: React.FC = () => {
  const navigate = useNavigate();

  // Get all non-fieldnotes posts sorted by date
  const sortedPosts = useMemo(() => {
    return posts
      .filter(p => p.category !== 'fieldnotes')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, []);

  const latestPost = sortedPosts[0];
  const recentPosts = sortedPosts.slice(1, 4);

  const getLatestStyle = (cat: Category) => {
    // Extract base color name to apply border
    if(cat === 'projects') return 'text-emerald-600 border-emerald-600';
    if(cat === 'threads') return 'text-amber-600 border-amber-600';
    if(cat === 'bits2bricks') return 'text-blue-600 border-blue-600';
    return 'text-black border-black';
  };

  const latestStyle = latestPost ? getLatestStyle(latestPost.category) : '';

  return (
    <div className="flex flex-col gap-16 animate-fade-in pt-6">
      <section className="max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 lowercase tracking-tight">identity</h1>
        
        <div className="mb-6 flex items-center gap-2">
           <span className="relative flex h-3 w-3">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
           </span>
           <span className="font-mono text-xs uppercase tracking-widest text-gray-400">system_status: operational</span>
        </div>

        <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-4 text-justify font-light">
          i am an engineer obsessed with the space where theoretical physics meets hard infrastructure. 
          infraphysics is my digital garden. a collection of thoughts, experiments, and builds.
        </p>
        <p className="text-sm md:text-base text-gray-600 leading-relaxed text-justify font-light">
          here i explore software entropy, hardware permanence, and the aesthetics of minimal logic.
          everything here is raw input. no algorithms. just bits.
        </p>
      </section>
      
      {/* LATEST TRANSMISSION SECTION */}
      {latestPost && (
        <section onClick={() => navigate(`/${latestPost.category}/${latestPost.id}`)} className="cursor-pointer group mb-0">
          <div className={`w-full bg-transparent border-2 p-6 md:p-10 flex flex-col justify-between min-h-[240px] hover:bg-gray-50 transition-colors duration-300 ${latestStyle}`}>
             {/* Top Row */}
             <div className="flex justify-between items-start text-[10px] md:text-xs font-mono tracking-[0.2em] uppercase opacity-60 mb-8">
               <span>latest_transmission</span>
               <span>{latestPost.date.replace(/-/g, '.')}</span>
             </div>
             
             {/* Center Title */}
             <h2 className="text-3xl md:text-5xl font-bold uppercase leading-tight mb-8 self-start tracking-tighter">
               {latestPost.displayTitle || latestPost.title}
             </h2>

             {/* Bottom Row */}
             <div className="flex justify-between items-end text-[10px] md:text-xs font-mono tracking-[0.2em] uppercase mt-auto">
               <span className="opacity-70">{latestPost.category}</span>
             </div>
          </div>
        </section>
      )}

      {/* RECENT POSTS SECTION (GRID LAYOUT) */}
      {recentPosts.length > 0 && (
        <section className="mt-0 pt-0">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {recentPosts.map(post => (
                <Link key={post.id} to={`/${post.category}/${post.id}`} className="group block">
                   <div className="aspect-video bg-gray-100 mb-4 overflow-hidden border border-gray-100">
                      {/* Clean image without grayscale effects */}
                      <img src={post.thumbnail || 'https://via.placeholder.com/150'} alt="" className="w-full h-full object-cover" />
                   </div>
                   <div className="flex justify-between items-baseline mb-2">
                      <span className="text-[10px] uppercase font-bold text-gray-400 font-mono">{post.category}</span>
                      <span className="text-[10px] text-gray-300 font-mono">{post.date}</span>
                   </div>
                   <h4 className="text-sm font-bold leading-tight group-hover:underline decoration-1 underline-offset-4 tracking-tight">
                      {post.displayTitle || post.title}
                   </h4>
                </Link>
             ))}
           </div>
        </section>
      )}
    </div>
  );
};

// --- MAIN APP COMPONENT ---

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-white text-black font-sans selection:bg-black selection:text-white relative">
        {/* Top Heavy Bar */}
        <div className="h-2 w-full bg-black"></div>
        
        <Navbar />
        
        {/* Adjusted bottom padding for mobile: pb-10 md:pb-20 */}
        <main className="flex-grow w-full max-w-4xl mx-auto px-6 pb-10 md:pb-20">
          <Routes>
            <Route path="/" element={<HomeView />} />
            
            <Route path="/projects" element={<SectionView category="projects" colorClass="text-emerald-600" />} />
            <Route path="/threads" element={<SectionView category="threads" colorClass="text-amber-600" />} />
            <Route path="/bits2bricks" element={<SectionView category="bits2bricks" colorClass="text-blue-600" />} />
            
            {/* Renamed Wetware to Field Notes */}
            <Route path="/fieldnotes" element={<FieldNotesView />} />
            <Route path="/fieldnotes/:id" element={<FieldNotesView />} />
            
            <Route path="/about" element={<AboutView />} />
            <Route path="/authors" element={<AuthorsView />} />

            {/* General post view for other categories */}
            <Route path="/:category/:id" element={<PostView />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;