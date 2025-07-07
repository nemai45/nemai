"use client"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArtistPaymentHistory } from '@/lib/type';
import { format } from 'date-fns';
import { CreditCard, IndianRupee } from 'lucide-react';


const ArtistPayment = ({ payments, pendingAmount }: { payments: ArtistPaymentHistory[], pendingAmount: number }) => {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Payment Management</h1>
          <p className="text-gray-600">Manage artist payments and create payment slips</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Amount Owed</p>
                  <p className="text-2xl font-bold text-red-600">{pendingAmount}</p>
                </div>
                <IndianRupee className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              All Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map(payment => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <span className="text-lg font-semibold text-green-600">{payment.amount}</span>
                    </TableCell>
                    <TableCell className="text-gray-600">{format(new Date(payment.created_at), "dd MMM yyyy")}</TableCell>
                    <TableCell>
                      {payment.notes ? <span className="text-gray-500">{payment.notes}</span> : <span className="text-gray-500">No notes</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ArtistPayment;
