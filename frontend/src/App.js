import React, { useState, useEffect, useMemo } from 'react';
import "./App.css";
import { 
  NetflixHeader, 
  HeroBanner, 
  ContentRow, 
  VideoPlayer, 
  MovieModal, 
  SearchResults,
  LoadingSkeleton 
} from './components';
import moviesData from './data/movies.json';

// Main Netflix App Component
function App() {
  const [movies, setMovies] = useState([]);
  const [categories, setCategories] = useState({});
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState({});

  // Initialize data
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setMovies(moviesData.movies);
      setCategories(moviesData.categories);
      
      // Initialize pagination for each category
      const initialPages = {};
      Object.keys(moviesData.categories).forEach(category => {
        initialPages[category] = 1;
      });
      setCurrentPage(initialPages);
      
      setIsLoading(false);
    }, 1000); // Simulate loading time
  }, []);

  // Featured movie (first movie in featured category)
  const featuredMovie = useMemo(() => {
    if (categories.featured && categories.featured.length > 0) {
      return movies.find(movie => movie.id === categories.featured[0]);
    }
    return movies[0];
  }, [movies, categories]);

  // Search functionality with debouncing
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(() => {
      const results = movies.filter(movie => {
        const query = searchQuery.toLowerCase();
        return (
          movie.title.toLowerCase().includes(query) ||
          movie.description.toLowerCase().includes(query) ||
          movie.genre.some(g => g.toLowerCase().includes(query)) ||
          movie.cast.some(actor => actor.toLowerCase().includes(query)) ||
          movie.director.toLowerCase().includes(query) ||
          movie.year.toString().includes(query)
        );
      });
      setSearchResults(results);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, movies]);

  // Get movies for a specific category with pagination
  const getMoviesForCategory = (categoryName, page = 1, itemsPerPage = 20) => {
    const categoryMovieIds = categories[categoryName] || [];
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return categoryMovieIds
      .slice(startIndex, endIndex)
      .map(movieId => movies.find(movie => movie.id === movieId))
      .filter(Boolean);
  };

  // Load more movies for a category
  const loadMoreMovies = (categoryName) => {
    setCurrentPage(prev => ({
      ...prev,
      [categoryName]: (prev[categoryName] || 1) + 1
    }));
  };

  // Event handlers
  const handlePlay = (movie) => {
    setSelectedMovie(movie);
    setIsPlaying(true);
  };

  const handleMoreInfo = (movie) => {
    setSelectedMovie(movie);
    setShowModal(true);
  };

  const handleClosePlayer = () => {
    setIsPlaying(false);
    setSelectedMovie(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedMovie(null);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // Show loading skeleton while data is loading
  if (isLoading) {
    return (
      <div className="bg-black min-h-screen">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen">
      {/* Video Player */}
      {isPlaying && selectedMovie && (
        <VideoPlayer
          movie={selectedMovie}
          onClose={handleClosePlayer}
        />
      )}

      {/* Movie Details Modal */}
      {showModal && selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={handleCloseModal}
          onPlay={handlePlay}
        />
      )}

      {/* Header */}
      <NetflixHeader
        onSearch={handleSearch}
        searchQuery={searchQuery}
      />

      {/* Main Content */}
      {searchQuery ? (
        // Search Results
        <div className="pt-20">
          <SearchResults
            results={searchResults}
            onPlay={handlePlay}
            onMoreInfo={handleMoreInfo}
            isLoading={isSearching}
          />
        </div>
      ) : (
        // Normal Netflix Interface
        <>
          {/* Hero Banner */}
          {featuredMovie && (
            <HeroBanner
              featuredMovie={featuredMovie}
              onPlay={handlePlay}
              onMoreInfo={handleMoreInfo}
            />
          )}

          {/* Content Rows */}
          <div className="relative -mt-32 z-20 space-y-8 pb-16">
            {/* Trending Now */}
            <ContentRow
              title="Trending Now"
              movies={getMoviesForCategory('trending', currentPage.trending || 1)}
              onPlay={handlePlay}
              onMoreInfo={handleMoreInfo}
            />

            {/* Netflix Originals */}
            <ContentRow
              title="Netflix Originals"
              movies={getMoviesForCategory('netflix_originals', currentPage.netflix_originals || 1)}
              onPlay={handlePlay}
              onMoreInfo={handleMoreInfo}
            />

            {/* Popular on Netflix */}
            <ContentRow
              title="Popular on Netflix"
              movies={getMoviesForCategory('popular', currentPage.popular || 1)}
              onPlay={handlePlay}
              onMoreInfo={handleMoreInfo}
            />

            {/* Action Movies */}
            <ContentRow
              title="Action & Adventure"
              movies={getMoviesForCategory('action', currentPage.action || 1)}
              onPlay={handlePlay}
              onMoreInfo={handleMoreInfo}
            />

            {/* Dramas */}
            <ContentRow
              title="Dramas"
              movies={getMoviesForCategory('drama', currentPage.drama || 1)}
              onPlay={handlePlay}
              onMoreInfo={handleMoreInfo}
            />

            {/* Sci-Fi */}
            <ContentRow
              title="Sci-Fi Movies"
              movies={getMoviesForCategory('sci-fi', currentPage['sci-fi'] || 1)}
              onPlay={handlePlay}
              onMoreInfo={handleMoreInfo}
            />

            {/* Anime */}
            <ContentRow
              title="Anime Series"
              movies={getMoviesForCategory('anime', currentPage.anime || 1)}
              onPlay={handlePlay}
              onMoreInfo={handleMoreInfo}
            />

            {/* Crime Shows */}
            <ContentRow
              title="Crime TV Shows"
              movies={getMoviesForCategory('crime', currentPage.crime || 1)}
              onPlay={handlePlay}
              onMoreInfo={handleMoreInfo}
            />

            {/* Thrillers */}
            <ContentRow
              title="Thrillers"
              movies={getMoviesForCategory('thriller', currentPage.thriller || 1)}
              onPlay={handlePlay}
              onMoreInfo={handleMoreInfo}
            />

            {/* International */}
            <ContentRow
              title="International Movies"
              movies={getMoviesForCategory('international', currentPage.international || 1)}
              onPlay={handlePlay}
              onMoreInfo={handleMoreInfo}
            />

            {/* Fantasy */}
            <ContentRow
              title="Fantasy"
              movies={getMoviesForCategory('fantasy', currentPage.fantasy || 1)}
              onPlay={handlePlay}
              onMoreInfo={handleMoreInfo}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default App;
