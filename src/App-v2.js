import { React, useEffect, useState } from "react";
import StarRating from "./StarRating";

const average = ( arr ) =>
  arr.reduce( ( acc, cur, i, arr ) => acc + cur / arr.length, 0 );

const KEY = "87c61195";

export default function App ()
{
  const [ movies, setMovies ] = useState( [] );
  const [ watched, setWatched ] = useState( [] );
  const [ isLoading, setIsLoading ] = useState( false );
  const [ error, setError ] = useState( "" );
  const [ query, setQuery ] = useState( "" );
  const [ selectedId, setSelectedId ] = useState( null );

  function handleSelectMovie ( id )
  {
    setSelectedId( ( selectedId ) => ( id === selectedId ? null : id ) );
  };

  function handleCloseMovie ()
  {
    setSelectedId( null );
  };

  function handleAddToWatched ( movie )
  {
    setWatched( ( watched ) => [ ...watched, movie ] );
  }

  function handleRemoveFromWatched ( id )
  {
    setWatched( ( watched ) => watched.filter( ( movie ) => movie.imdbID !== id ) );
  }

  useEffect( function ()
  {

    const controller = new AbortController();

    async function fetchMovies ()
    {
      try
      {
        setIsLoading( true );
        setError( "" );
        const res = await fetch( `http://www.omdbapi.com/?i=tt3896198&apikey=${ KEY }&s=${ query }`, { signal: controller.signal } );

        if ( !res.ok ) { throw new Error( "Failed to fetch movies" ); };


        const data = await res.json();
        if ( data.Response === "False" ) throw new Error( data.Error );
        setMovies( data.Search );
        setError( "" );
      }
      catch ( err )
      {
        if ( err.name === "AbortError" ) return;
        setError( err.message );
      }
      finally
      {
        setIsLoading( false );
      }
    }

    if ( query.length < 3 )
    {
      setMovies( [] );
      setError( "" );
      return;
    };

    handleCloseMovie();
    fetchMovies();

    return function ()
    {
      controller.abort();
    };
  }, [ query ] );


  return (
    <>
      <NavBar>
        <Logo />
        <SearchBar query={ query } setQuery={ setQuery } />
        <NumOfResults movies={ movies } />
      </NavBar>
      <Main>
        <Box>
          { isLoading && <Loader /> }
          { !isLoading && !error && <MovieList movies={ movies } handleSelectMovie={ handleSelectMovie } /> }
          { error && <ErrorMessage message={ error } /> }
        </Box>
        <Box>
          { selectedId ? (
            <MovieDetails
              selectedId={ selectedId }
              onCloseMovie={ handleCloseMovie }
              onAddToWatched={ handleAddToWatched }
              watched={ watched }
            />
          ) : (
            <>
              <WatchedSummary watched={ watched } />
              <WatchedMovieList
                watched={ watched }
                onRemoveFromWatched={ handleRemoveFromWatched }
              />
            </>
          ) }
        </Box>
      </Main>
    </>
  );
}

function Loader ()
{
  return (
    <div className="loader">
      <span>🍿</span>Loading...
    </div>
  );
}

function ErrorMessage ( { message } )
{
  return (
    <p className="error">
      <span>⛔</span>{ message }
    </p>
  );
}

function NavBar ( { children } )
{
  return (
    <nav className="nav-bar">
      { children }
    </nav>
  );
}

function Logo ()
{
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function SearchBar ( { query, setQuery } )
{
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={ query }
      onChange={ ( e ) => setQuery( e.target.value ) }
    />
  );
}

function NumOfResults ( { movies } )
{
  return (
    <p className="num-results">
      Found <strong>{ movies?.length }</strong> results
    </p>
  );
}

function Main ( { children } )
{

  return (
    <main className="main">
      { children }
    </main>
  );
}

function Box ( { children } )
{
  const [ isOpen, setIsOpen ] = useState( true );
  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={ () => setIsOpen( ( open ) => !open ) }
      >
        { isOpen ? "–" : "+" }
      </button>
      { isOpen && children }
    </div>
  );
}

function MovieList ( { movies, handleSelectMovie } )
{
  return (
    <ul className="list list-movies">
      { movies?.map( ( movie ) => (
        <Movie key={ movie.imdbID } movie={ movie } handleSelectMovie={ handleSelectMovie } />
      ) ) }
    </ul>
  );
}

function Movie ( { movie, handleSelectMovie } )
{
  return (
    <li onClick={ () => handleSelectMovie( movie.imdbID ) }>
      <img src={ movie.Poster } alt={ `${ movie.Title } poster` } />
      <h3>{ movie.Title }</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{ movie.Year }</span>
        </p>
      </div>
    </li>
  );
}

function MovieDetails ( { selectedId, onCloseMovie, onAddToWatched, watched } )
{
  const [ movie, setMovie ] = useState( {} );
  const [ isLoading, setIsLoading ] = useState( false );
  const [ userRating, setUserRating ] = useState( "" );

  const isWatched = watched.some( ( movie ) => movie.imdbID === selectedId );

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  function handleAddToWatched ()
  {
    const newMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      runtime: Number( runtime.split( " " )[ 0 ] ),
      imdbRating: Number( imdbRating ),
      userRating: Number( userRating ),
    };

    onAddToWatched( newMovie );
    onCloseMovie();
  }

  useEffect( function ()
  {
    function callback ( e )
    {
      if ( e.key === "Escape" )
      {
        onCloseMovie();
      }
    }
    document.addEventListener( "keydown", callback );
    return function ()
    {
      document.removeEventListener( "keydown", callback );
    };
  }, [ onCloseMovie ] );

  useEffect( function ()
  {
    async function fetchMovie ()
    {
      setIsLoading( true );
      const res = await fetch( `http://www.omdbapi.com/?apikey=${ KEY }&i=${ selectedId }` );


      const data = await res.json();
      setMovie( data );
      setIsLoading( false );
    }

    fetchMovie();

  }, [ selectedId ] );

  useEffect( function ()
  {
    document.title = title ? `Movie: ${ title }` : "usePopcorn";
    return function ()
    {
      document.title = "usePopcorn";
    };
  }, [ title ] );

  return (
    <div className="details">
      { isLoading ? <Loader /> :
        <>
          <header>
            <button className="btn-back" onClick={ onCloseMovie }>
              &larr;
            </button>
            <img src={ poster } alt={ `Poster of ${ title }` } />
            <div className="details-overview">
              <h2>{ title }</h2>
              <p>{ released } &bull; { runtime }</p>
              <p>{ genre }</p>
              <p><span>⭐</span> { imdbRating } IMDb Rating</p>
            </div>
          </header>

          <section>
            <div className="rating">
              { isWatched ?
                <StarRating
                  maxRating={ 10 }
                  size={ 24 }
                  onSetRating={ setUserRating }
                  defaultRating={ watched.find( ( movie ) => movie.imdbID === selectedId ).userRating }
                /> :
                <>
                  <StarRating
                    maxRating={ 10 }
                    size={ 24 }
                    onSetRating={ setUserRating }
                  />
                  { userRating > 0 && <button
                    className="btn-add"
                    onClick={ handleAddToWatched }
                  >
                    + Add to Watched
                  </button> }
                </>
              }
            </div>
            <p><em>{ plot }</em></p>
            <p>Starring { actors }</p>
            <p>Directed by { director }</p>
          </section>
        </>
      }
    </div>
  );
}

function WatchedSummary ( { watched } )
{
  const avgImdbRating = Math.round( ( average( watched.map( ( movie ) => movie.imdbRating ) ) ) * 10 ) / 10;
  const avgUserRating = Math.round( ( average( watched.map( ( movie ) => movie.userRating ) ) ) * 10 ) / 10;
  const avgRuntime = Math.round( ( average( watched.map( ( movie ) => movie.runtime ) ) ) * 10 ) / 10;
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{ watched.length } movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{ avgImdbRating }</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{ avgUserRating }</span>
        </ p>
        <p>
          <span>⏳</span>
          <span>{ avgRuntime } min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMovieList ( { watched, onRemoveFromWatched } )
{
  return (
    <ul className="list">
      { watched.map( ( movie ) => (
        <WatchedMovie key={ movie.imdbID } movie={ movie } onRemoveFromWatched={ onRemoveFromWatched } />
      ) ) }
    </ul>
  );
}

function WatchedMovie ( { movie, onRemoveFromWatched } )
{
  return (
    <li>
      <img src={ movie.poster } alt={ `${ movie.title } poster` } />
      <h3>{ movie.title }</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{ movie.imdbRating }</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{ movie.userRating }</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{ movie.runtime } min</span>
        </p>
      </div>
      <button className="btn-delete" onClick={ () => onRemoveFromWatched( movie.imdbID ) } >X</button>
    </li>
  );
}