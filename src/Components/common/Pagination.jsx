import React from "react";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

function Pagination({
  currentPage = 1,
  totalPages = 1,
  pageSize = 10,
  totalElements = 0,
  onPageChange,
  onPageSizeChange,
  className = "",
}) {
  if (totalElements <= 0) return null;

  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalElements);
  const endItem = Math.min(currentPage * pageSize, totalElements);

  // Generate page numbers array
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#e6dfd8] text-xs text-[#6c6a64] font-medium ${className}`}>
      {/* Information text & Page Size Selector */}
      <div className="flex flex-wrap items-center gap-3">
        <span>
          Showing <strong className="text-[#141413] font-bold">{startItem}</strong> to{" "}
          <strong className="text-[#141413] font-bold">{endItem}</strong> of{" "}
          <strong className="text-[#cc785c] font-bold">{totalElements}</strong> entries
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-[11px] text-[#8e8b82]">Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-[#faf9f5] border border-[#e6dfd8] rounded-md px-2 py-1 text-xs font-semibold text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#cc785c] cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        )}
      </div>

      {/* Page Navigation Controls */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => onPageChange && onPageChange(1)}
          disabled={currentPage <= 1}
          className="h-8 w-8 rounded-lg border-[#e6dfd8] bg-[#faf9f5] hover:bg-[#efe9de] text-[#141413] disabled:opacity-40 cursor-pointer"
          title="First Page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous Page */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange && onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-8 px-2.5 rounded-lg border-[#e6dfd8] bg-[#faf9f5] hover:bg-[#efe9de] text-[#141413] disabled:opacity-40 cursor-pointer gap-1"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Prev</span>
        </Button>

        {/* Numbered Page Buttons */}
        {pageNumbers.map((page) => (
          <Button
            key={page}
            type="button"
            variant={currentPage === page ? "primary" : "outline"}
            size="sm"
            onClick={() => onPageChange && onPageChange(page)}
            className={`h-8 w-8 p-0 rounded-lg text-xs font-bold transition cursor-pointer ${
              currentPage === page
                ? "bg-[#cc785c] text-white hover:bg-[#a9583e] shadow-xs"
                : "border-[#e6dfd8] bg-[#faf9f5] hover:bg-[#efe9de] text-[#141413]"
            }`}
          >
            {page}
          </Button>
        ))}

        {/* Next Page */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange && onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-8 px-2.5 rounded-lg border-[#e6dfd8] bg-[#faf9f5] hover:bg-[#efe9de] text-[#141413] disabled:opacity-40 cursor-pointer gap-1"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>

        {/* Last Page */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => onPageChange && onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          className="h-8 w-8 rounded-lg border-[#e6dfd8] bg-[#faf9f5] hover:bg-[#efe9de] text-[#141413] disabled:opacity-40 cursor-pointer"
          title="Last Page"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default Pagination;
