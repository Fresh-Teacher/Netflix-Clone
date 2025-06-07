import React, { useState, useEffect, useRef } from 'react';

// Custom Video Player Component
export const VideoPlayer = ({ movie, onClose }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [quality, setQuality] = useState('1080p');
  const controlsTimeoutRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    const rect = e.target.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    video.currentTime = percent * duration;
  };

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value;
    setVolume(newVolume);
    videoRef.current.volume = newVolume;
  };

  const toggleFullscreen = () => {
    const container = videoRef.current.parentElement;
    if (!isFullscreen) {
      container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Security Overlay to prevent right-click */}
      <div 
        className="absolute inset-0 z-10"
        onContextMenu={(e) => e.preventDefault()}
        onMouseMove={showControlsTemporarily}
      />
      
      <div className="relative w-full h-full max-w-full max-h-full">
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          src={movie.videoUrl}
          onContextMenu={(e) => e.preventDefault()}
          onLoadStart={() => setIsPlaying(false)}
        />

        {/* Controls Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/50 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          {/* Top Controls */}
          <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center">
            <button
              onClick={onClose}
              className="text-white hover:text-red-500 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="text-white">
              <h2 className="text-xl font-bold">{movie.title}</h2>
              <p className="text-sm opacity-75">{movie.year} • {movie.rating} • {movie.duration}</p>
            </div>

            <div className="flex items-center space-x-4">
              <select 
                value={quality} 
                onChange={(e) => setQuality(e.target.value)}
                className="bg-black/50 text-white rounded px-2 py-1 text-sm"
              >
                {movie.quality.map(q => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Center Play Button */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={togglePlay}
                className="bg-red-600 hover:bg-red-700 rounded-full p-6 transition-colors"
              >
                <svg className="w-12 h-12 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
            </div>
          )}

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            {/* Progress Bar */}
            <div 
              className="w-full h-1 bg-gray-600 rounded-full mb-4 cursor-pointer"
              onClick={handleSeek}
            >
              <div 
                className="h-full bg-red-600 rounded-full transition-all duration-100"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>

            {/* Control Buttons */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <button onClick={togglePlay} className="text-white hover:text-red-500 transition-colors">
                  {isPlaying ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>

                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                  </svg>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-gray-600 rounded-lg appearance-none slider"
                  />
                </div>

                <span className="text-white text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <button 
                onClick={toggleFullscreen}
                className="text-white hover:text-red-500 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Netflix Header Component
export const NetflixHeader = ({ onSearch, searchQuery }) => {
  const [showSearch, setShowSearch] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="fixed top-0 w-full z-40 bg-gradient-to-b from-black to-transparent">
      <div className="flex items-center justify-between px-8 py-4">
        {/* Logo and Navigation */}
        <div className="flex items-center space-x-8">
          <div className="text-red-600 text-2xl font-bold">NETFLIX</div>
          <nav className="hidden md:flex space-x-6">
            <a href="#" className="text-white hover:text-gray-300 transition-colors">Home</a>
            <a href="#" className="text-white hover:text-gray-300 transition-colors">TV Shows</a>
            <a href="#" className="text-white hover:text-gray-300 transition-colors">Movies</a>
            <a href="#" className="text-white hover:text-gray-300 transition-colors">New & Popular</a>
            <a href="#" className="text-white hover:text-gray-300 transition-colors">My List</a>
          </nav>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            {showSearch ? (
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Search movies, shows..."
                className="bg-black/70 text-white px-4 py-2 rounded border border-gray-600 focus:border-red-600 outline-none w-64"
                autoFocus
                onBlur={() => !searchQuery && setShowSearch(false)}
              />
            ) : (
              <button
                onClick={() => setShowSearch(true)}
                className="text-white hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            )}
          </div>

          {/* Notifications */}
          <button className="text-white hover:text-gray-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.405-3.405A6.5 6.5 0 1118 11.5V15z" />
            </svg>
          </button>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-8 h-8 bg-red-600 rounded"
            />
            {showProfileMenu && (
              <div className="absolute right-0 top-10 bg-black/90 border border-gray-600 rounded-md py-2 w-48">
                <a href="#" className="block px-4 py-2 text-white hover:bg-gray-700">Manage Profiles</a>
                <a href="#" className="block px-4 py-2 text-white hover:bg-gray-700">Account</a>
                <a href="#" className="block px-4 py-2 text-white hover:bg-gray-700">Help Center</a>
                <hr className="border-gray-600 my-2" />
                <a href="#" className="block px-4 py-2 text-white hover:bg-gray-700">Sign out of Netflix</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

// Hero Banner Component
export const HeroBanner = ({ featuredMovie, onPlay, onMoreInfo }) => {
  return (
    <div className="relative h-screen">
      <div className="absolute inset-0">
        <img
          src={featuredMovie.backdrop}
          alt={featuredMovie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      <div className="relative z-10 flex items-center h-full px-8 md:px-16">
        <div className="max-w-lg">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            {featuredMovie.title}
          </h1>
          <p className="text-lg text-white mb-8 leading-relaxed">
            {featuredMovie.description}
          </p>
          
          <div className="flex space-x-4">
            <button
              onClick={() => onPlay(featuredMovie)}
              className="bg-white text-black px-8 py-3 rounded flex items-center space-x-2 hover:bg-gray-200 transition-colors font-semibold"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <span>Play</span>
            </button>
            
            <button
              onClick={() => onMoreInfo(featuredMovie)}
              className="bg-gray-500/70 text-white px-8 py-3 rounded flex items-center space-x-2 hover:bg-gray-500/90 transition-colors font-semibold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>More Info</span>
            </button>
          </div>

          <div className="flex items-center space-x-4 mt-6 text-white">
            <span className="border border-gray-400 px-2 py-1 text-sm">{featuredMovie.rating}</span>
            <span>{featuredMovie.year}</span>
            <span>{featuredMovie.duration}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Movie Card Component
export const MovieCard = ({ movie, onPlay, onMoreInfo }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState(null);

  const handleMouseEnter = () => {
    const timeout = setTimeout(() => {
      setIsHovered(true);
    }, 500);
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    setIsHovered(false);
  };

  return (
    <div
      className="relative group cursor-pointer transition-transform duration-300 hover:scale-105"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="aspect-video bg-gray-800 rounded-md overflow-hidden">
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Hover Card */}
      {isHovered && (
        <div className="absolute top-0 left-0 w-full bg-gray-900 rounded-md shadow-2xl z-30 transform scale-110 border border-gray-600">
          <div className="aspect-video relative">
            <img
              src={movie.backdrop}
              alt={movie.title}
              className="w-full h-full object-cover rounded-t-md"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
          </div>
          
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex space-x-2">
                <button
                  onClick={() => onPlay(movie)}
                  className="bg-white text-black rounded-full p-2 hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>
                <button className="border border-gray-600 text-white rounded-full p-2 hover:border-white transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
                <button className="border border-gray-600 text-white rounded-full p-2 hover:border-white transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                </button>
              </div>
              
              <button
                onClick={() => onMoreInfo(movie)}
                className="border border-gray-600 text-white rounded-full p-2 hover:border-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            <h3 className="text-white font-semibold text-sm mb-1">{movie.title}</h3>
            
            <div className="flex items-center space-x-2 text-xs text-gray-400 mb-2">
              <span className="text-green-500 font-semibold">{Math.round(movie.imdbRating * 10)}% Match</span>
              <span className="border border-gray-600 px-1">{movie.rating}</span>
              <span>{movie.year}</span>
            </div>

            <div className="flex flex-wrap gap-1">
              {movie.genre.slice(0, 3).map((genre, index) => (
                <span key={index} className="text-xs text-gray-400">
                  {genre}{index < Math.min(movie.genre.length, 3) - 1 && ' • '}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Content Row Component
export const ContentRow = ({ title, movies, onPlay, onMoreInfo }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    const container = scrollRef.current;
    const scrollAmount = 300;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <div className="mb-8">
      <h2 className="text-white text-xl font-semibold mb-4 px-8">{title}</h2>
      
      <div className="relative group">
        {/* Left Scroll Button */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Movies Container */}
        <div
          ref={scrollRef}
          className="flex space-x-4 overflow-x-auto scrollbar-hide px-8 pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {movies.map((movie) => (
            <div key={movie.id} className="flex-none w-64">
              <MovieCard
                movie={movie}
                onPlay={onPlay}
                onMoreInfo={onMoreInfo}
              />
            </div>
          ))}
        </div>

        {/* Right Scroll Button */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Movie Details Modal
export const MovieModal = ({ movie, onClose, onPlay }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8">
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header Image */}
        <div className="relative h-80">
          <img
            src={movie.backdrop}
            alt={movie.title}
            className="w-full h-full object-cover rounded-t-lg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-300 bg-black/50 rounded-full p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{movie.title}</h1>
              <div className="flex items-center space-x-4 text-gray-400">
                <span className="text-green-500 font-semibold">{Math.round(movie.imdbRating * 10)}% Match</span>
                <span>{movie.year}</span>
                <span className="border border-gray-600 px-2 py-1 text-xs">{movie.rating}</span>
                <span>{movie.duration}</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => onPlay(movie)}
                className="bg-white text-black px-6 py-2 rounded flex items-center space-x-2 hover:bg-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                <span>Play</span>
              </button>
              
              <button className="border border-gray-600 text-white px-6 py-2 rounded hover:border-white transition-colors">
                + My List
              </button>
            </div>
          </div>

          <p className="text-white text-lg mb-6 leading-relaxed">{movie.description}</p>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-white font-semibold mb-2">Cast</h3>
              <p className="text-gray-400">{movie.cast.join(', ')}</p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-2">Genres</h3>
              <p className="text-gray-400">{movie.genre.join(', ')}</p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-2">Director</h3>
              <p className="text-gray-400">{movie.director}</p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-2">Available in</h3>
              <p className="text-gray-400">{movie.quality.join(', ')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Search Results Component
export const SearchResults = ({ results, onPlay, onMoreInfo, isLoading }) => {
  if (isLoading) {
    return (
      <div className="px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-video bg-gray-800 rounded-md animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="px-8 py-16 text-center">
        <h2 className="text-white text-2xl mb-4">No results found</h2>
        <p className="text-gray-400">Try different keywords or browse our categories</p>
      </div>
    );
  }

  return (
    <div className="px-8 py-16">
      <h2 className="text-white text-2xl font-semibold mb-8">
        Search Results ({results.length})
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {results.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onPlay={onPlay}
            onMoreInfo={onMoreInfo}
          />
        ))}
      </div>
    </div>
  );
};

// Loading Skeleton Component
export const LoadingSkeleton = () => {
  return (
    <div className="space-y-8">
      {/* Hero Skeleton */}
      <div className="h-screen bg-gray-800 animate-pulse" />
      
      {/* Content Rows Skeleton */}
      {[...Array(4)].map((_, i) => (
        <div key={i} className="px-8">
          <div className="h-6 bg-gray-800 rounded w-48 mb-4 animate-pulse" />
          <div className="flex space-x-4">
            {[...Array(6)].map((_, j) => (
              <div key={j} className="w-64 aspect-video bg-gray-800 rounded animate-pulse" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};