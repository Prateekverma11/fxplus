import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Bookmark } from 'lucide-react';

export default function CurrencySearchBar({
  currencies = [],
  selectedCurrency = 'USD',
  onSelectCurrency,
  bookmarks = [],
  onToggleBookmark
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = currencies.filter(c => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      c.code.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q)
    );
  }).filter(c => c.code !== 'INR'); // Exclude INR from foreign currency search

  useEffect(() => {
    setHighlightedIndex(0);
  }, [query]);

  const handleSelect = (code) => {
    onSelectCurrency(code);
    setIsOpen(false);
    setQuery('');
    if (inputRef.current) inputRef.current.blur();
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[highlightedIndex]) {
        handleSelect(filtered[highlightedIndex].code);
      } else if (filtered[0]) {
        handleSelect(filtered[0].code);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xs">
      <div className="relative flex items-center">
        <Search className="w-4 h-4 absolute left-3 text-zinc-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search currency..."
          className="w-full pl-9 pr-8 py-2 bg-white text-zinc-900 placeholder-zinc-400 text-sm rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-2.5 text-zinc-400 hover:text-zinc-600 p-0.5"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-zinc-200 rounded-xl shadow-lg z-50 max-h-72 overflow-y-auto py-1">
          {filtered.length > 0 ? (
            filtered.map((curr, idx) => {
              const isSelected = curr.code === selectedCurrency;
              const isHighlighted = idx === highlightedIndex;
              const isBookmarked = bookmarks.includes(curr.code);

              return (
                <div
                  key={curr.code}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(curr.code);
                  }}
                  className={`w-full px-3.5 py-2.5 cursor-pointer flex items-center justify-between transition-colors ${
                    isHighlighted
                      ? 'bg-zinc-100 text-zinc-900'
                      : isSelected
                      ? 'bg-zinc-50 font-medium'
                      : 'hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-md bg-zinc-100 border border-zinc-200/60 flex items-center justify-center text-xs font-semibold text-zinc-700">
                      {curr.symbol || curr.code[0]}
                    </span>
                    <div>
                      <span className="text-sm font-medium text-zinc-900">{curr.code}</span>
                      <span className="text-xs text-zinc-500 ml-2 font-normal">{curr.name}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400 font-normal">→ INR</span>
                    {onToggleBookmark && (
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onToggleBookmark(curr.code);
                        }}
                        className={`p-1 rounded hover:bg-zinc-200/60 transition-colors ${
                          isBookmarked ? 'text-amber-500' : 'text-zinc-300 hover:text-amber-500'
                        }`}
                        title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500' : ''}`} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-4 py-3 text-xs text-zinc-500 text-center font-normal">
              No currencies found matching &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
      )}
    </div>
  );
}

