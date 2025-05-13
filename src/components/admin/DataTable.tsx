
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import PaginationBar from "./Pagination";
import { cn } from "@/lib/utils";

interface DataTableProps<T> {
  currentPage?: number;
  columns: {
    key: keyof T | string;
    header: string;
    cell?: (item: T) => React.ReactNode;
  }[];
  fetcher: (startIndex: number, itemsCount: number) => Promise<{ data: T[], total: number | null, error: undefined } | { error: string, data:undefined, total: undefined }>;
  itemsPerPage?: number;
}

export async function DataTable<T>({
  currentPage = 1,
  columns,
  itemsPerPage = 5,
  fetcher
}: DataTableProps<T>) {
  const data = await fetcher((currentPage - 1) * itemsPerPage, itemsPerPage);
  if (!data) {
    return <div>Error fetching data</div>;
  }
  const { data: items, total, error } = data;
  if(error) {
    return <div>Error fetching data: {error}</div>; 
  }
  const totalPages = Math.ceil((total || 0) / itemsPerPage);
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-purple-50">
              {columns.map((column) => (
                <TableHead key={column.key as string} className="font-semibold">
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items!.map((item, index) => (
              <TableRow
                key={index}
                className={cn(index % 2 === 0 ? "bg-white" : "bg-purple-50/30", "h-16")}
              >
                {columns.map((column) => (
                  <TableCell key={`${index}-${column.key as string}`}>
                    {column.cell
                      ? column.cell(item)
                      : item[column.key as keyof T] as React.ReactNode}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <PaginationBar currentPage={currentPage} totalPages={totalPages} />
      )}
    </div>
  );
}
