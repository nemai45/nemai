import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";
import Link from 'next/link';
import { FC } from 'react';

interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
}

const PaginationBar: FC<PaginationBarProps> = ({ currentPage, totalPages }) => {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href={`?page=${Math.max(currentPage - 1, 1)}`}
            className={currentPage === 1 ? "opacity-50" : ""} />
        </PaginationItem>

        {Array.from({ length: totalPages }).map((_, i) => (
          <PaginationItem key={i}>
            <PaginationLink
              href={`?page=${i + 1}`}
              isActive={currentPage === i + 1}
            >
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext href={`?page=${Math.min(currentPage + 1, totalPages)}`}
            className={currentPage === totalPages ? "opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>)
}

export default PaginationBar