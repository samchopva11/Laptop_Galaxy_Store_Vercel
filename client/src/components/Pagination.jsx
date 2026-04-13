import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow + 2) {
      // If total pages is small, show all
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Determine range around current page
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // Adjust range to always show at least 3 pages in middle if possible
      if (currentPage <= 3) {
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-8 mb-4">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`p-2 rounded-xl border transition-all duration-300 ${
          currentPage === 1
            ? 'border-white/5 text-gray-700 cursor-not-allowed'
            : 'border-white/10 text-gray-300 hover:border-[var(--color-neon-blue)] hover:text-[var(--color-neon-blue)] hover:bg-[var(--color-neon-blue)]/5 active:scale-90'
        }`}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-2">
        {getPageNumbers().map((num, idx) => (
          num === '...' ? (
            <span key={`dots-${idx}`} className="px-2 text-gray-600 font-black tracking-widest">
              ...
            </span>
          ) : (
            <button
              key={num}
              onClick={() => onPageChange(num)}
              className={`w-10 h-10 rounded-xl font-black text-sm transition-all duration-300 border ${
                currentPage === num
                  ? 'bg-gradient-to-br from-[var(--color-neon-purple)] to-[var(--color-neon-blue)] border-transparent text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] scale-110'
                  : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/30 hover:bg-white/10 hover:text-white'
              }`}
            >
              {num}
            </button>
          )
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-xl border transition-all duration-300 ${
          currentPage === totalPages
            ? 'border-white/5 text-gray-700 cursor-not-allowed'
            : 'border-white/10 text-gray-300 hover:border-[var(--color-neon-blue)] hover:text-[var(--color-neon-blue)] hover:bg-[var(--color-neon-blue)]/5 active:scale-90'
        }`}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Pagination;
