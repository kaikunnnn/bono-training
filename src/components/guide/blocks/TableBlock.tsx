import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "@/components/ui/table";

interface TableRowData {
  _key: string;
  isHeader?: boolean;
  cells: string[];
}

interface TableBlockProps {
  value: {
    caption?: string;
    rows: TableRowData[];
  };
}

const TableBlock = ({ value }: TableBlockProps) => {
  const { rows, caption } = value;
  if (!rows?.length) return null;

  const headerRows: TableRowData[] = [];
  const bodyRows: TableRowData[] = [];
  for (const r of rows) {
    (r.isHeader ? headerRows : bodyRows).push(r);
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        {caption && <TableCaption className="mt-0 py-2 text-left px-4 bg-muted/30">{caption}</TableCaption>}
        {headerRows.length > 0 && (
          <TableHeader>
            {headerRows.map((row) => (
              <TableRow key={row._key} className="bg-muted/50">
                {row.cells?.map((cell, i) => (
                  <TableHead key={i} className="font-bold text-foreground">
                    {cell}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
        )}
        <TableBody>
          {bodyRows.map((row, rowIndex) => (
            <TableRow key={row._key} className={rowIndex % 2 === 1 ? "bg-muted/20" : ""}>
              {row.cells?.map((cell, i) => (
                <TableCell key={i} className="text-foreground/80">
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TableBlock;
