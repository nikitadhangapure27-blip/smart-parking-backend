import React from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      }
    }
    return pages
  }

  return (
    <div className="flex items-center justify-between px-2 py-4 border-t border-gray-100">
      <p className="text-sm text-gray-500">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <FaChevronLeft className="text-xs" />
        </button>
        {getPageNumbers().map((page, index) =>
          page === '...' ? (
            <span key={`dots-${index}`} className="px-2 text-gray-400">...</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                currentPage === page
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <FaChevronRight className="text-xs" />
        </button>
      </div>
    </div>
  )
}

export default Pagination